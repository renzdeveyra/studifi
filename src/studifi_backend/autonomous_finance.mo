import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Map "mo:base/HashMap";
import Text "mo:base/Text";
import Result "mo:base/Result";
import Array "mo:base/Array";
import Int "mo:base/Int";
import Timer "mo:base/Timer";
import Float "mo:base/Float";

actor AutonomousFinance {
    
    // Types for loan management
    public type Loan = {
        id: Text;
        studentId: Principal;
        principalAmount: Nat;
        interestRate: Float;
        termMonths: Nat;
        monthlyPayment: Nat;
        gracePeriodMonths: Nat;
        status: LoanStatus;
        disbursedAt: ?Int;
        firstPaymentDue: ?Int;
        totalPaid: Nat;
        remainingBalance: Nat;
        paymentsHistory: [Payment];
        createdAt: Int;
    };

    public type LoanStatus = {
        #Approved;
        #Disbursed;
        #InRepayment;
        #GracePeriod;
        #Completed;
        #Defaulted;
        #Deferred;
    };

    public type Payment = {
        id: Text;
        loanId: Text;
        amount: Nat;
        paymentDate: Int;
        dueDate: Int;
        paymentType: PaymentType;
        status: PaymentStatus;
    };

    public type PaymentType = {
        #Regular;
        #EarlyPayment;
        #LatePayment;
        #Penalty;
    };

    public type PaymentStatus = {
        #Scheduled;
        #Paid;
        #Overdue;
        #Failed;
    };

    public type DisbursementRequest = {
        loanId: Text;
        amount: Nat;
        recipientAccount: Text;
        purpose: Text;
    };

    public type AutomationRule = {
        id: Text;
        ruleType: RuleType;
        condition: Text;
        action: Text;
        isActive: Bool;
        lastExecuted: ?Int;
    };

    public type RuleType = {
        #DisbursementRule;
        #PaymentReminder;
        #DefaultNotification;
        #GracePeriodEnd;
    };

    // State management
    private stable var loansEntries : [(Text, Loan)] = [];
    private var loans = Map.HashMap<Text, Loan>(10, Text.equal, Text.hash);

    private stable var paymentsEntries : [(Text, Payment)] = [];
    private var payments = Map.HashMap<Text, Payment>(10, Text.equal, Text.hash);

    private stable var automationRulesEntries : [(Text, AutomationRule)] = [];
    private var automationRules = Map.HashMap<Text, AutomationRule>(10, Text.equal, Text.hash);

    private stable var nextLoanId : Nat = 1;
    private stable var nextPaymentId : Nat = 1;

    // Timer for autonomous operations
    private var automationTimer : ?Timer.TimerId = null;

    // Initialize from stable storage
    system func preupgrade() {
        loansEntries := Map.toArray(loans);
        paymentsEntries := Map.toArray(payments);
        automationRulesEntries := Map.toArray(automationRules);
        
        // Cancel timer before upgrade
        switch (automationTimer) {
            case (?timerId) { Timer.cancelTimer(timerId); };
            case null {};
        };
    };

    system func postupgrade() {
        loans := Map.fromIter<Text, Loan>(
            loansEntries.vals(), loansEntries.size(), Text.equal, Text.hash
        );
        payments := Map.fromIter<Text, Payment>(
            paymentsEntries.vals(), paymentsEntries.size(), Text.equal, Text.hash
        );
        automationRules := Map.fromIter<Text, AutomationRule>(
            automationRulesEntries.vals(), automationRulesEntries.size(), Text.equal, Text.hash
        );
        
        loansEntries := [];
        paymentsEntries := [];
        automationRulesEntries := [];

        // Restart automation timer
        startAutomationTimer();
    };

    // Initialize automation on first deployment
    system func init() {
        startAutomationTimer();
        setupDefaultAutomationRules();
    };

    // Loan creation and disbursement
    public func createLoan(
        studentId: Principal,
        principalAmount: Nat,
        interestRate: Float,
        termMonths: Nat,
        gracePeriodMonths: Nat
    ) : async Result.Result<Loan, Text> {
        let loanId = "LOAN-" # Int.toText(nextLoanId);
        nextLoanId += 1;

        let monthlyPayment = calculateMonthlyPayment(principalAmount, interestRate, termMonths);

        let loan : Loan = {
            id = loanId;
            studentId = studentId;
            principalAmount = principalAmount;
            interestRate = interestRate;
            termMonths = termMonths;
            monthlyPayment = monthlyPayment;
            gracePeriodMonths = gracePeriodMonths;
            status = #Approved;
            disbursedAt = null;
            firstPaymentDue = null;
            totalPaid = 0;
            remainingBalance = principalAmount;
            paymentsHistory = [];
            createdAt = Time.now();
        };

        loans.put(loanId, loan);
        #ok(loan)
    };

    public func disburseLoan(disbursementRequest: DisbursementRequest) : async Result.Result<Loan, Text> {
        switch (loans.get(disbursementRequest.loanId)) {
            case (?loan) {
                if (loan.status != #Approved) {
                    return #err("Loan is not in approved status");
                };

                let now = Time.now();
                let gracePeriodEnd = now + (loan.gracePeriodMonths * 30 * 24 * 60 * 60 * 1000_000_000); // Convert months to nanoseconds
                
                let updatedLoan = {
                    loan with 
                    status = #Disbursed;
                    disbursedAt = ?now;
                    firstPaymentDue = ?gracePeriodEnd;
                };

                loans.put(disbursementRequest.loanId, updatedLoan);

                // Schedule payment reminders
                await schedulePaymentReminders(disbursementRequest.loanId);

                // In a real implementation, this would trigger actual fund transfer
                Debug.print("Disbursing loan " # disbursementRequest.loanId # " amount: " # Int.toText(disbursementRequest.amount));

                #ok(updatedLoan)
            };
            case null {
                #err("Loan not found")
            };
        }
    };

    public func makePayment(loanId: Text, amount: Nat) : async Result.Result<Payment, Text> {
        switch (loans.get(loanId)) {
            case (?loan) {
                let paymentId = "PAY-" # Int.toText(nextPaymentId);
                nextPaymentId += 1;

                let now = Time.now();
                let payment : Payment = {
                    id = paymentId;
                    loanId = loanId;
                    amount = amount;
                    paymentDate = now;
                    dueDate = Option.get(loan.firstPaymentDue, now);
                    paymentType = #Regular;
                    status = #Paid;
                };

                payments.put(paymentId, payment);

                // Update loan balance
                let newBalance = Int.abs(loan.remainingBalance - amount);
                let newTotalPaid = loan.totalPaid + amount;
                let newStatus = if (newBalance == 0) { #Completed } else { #InRepayment };

                let updatedPaymentsHistory = Array.append(loan.paymentsHistory, [payment]);

                let updatedLoan = {
                    loan with 
                    remainingBalance = newBalance;
                    totalPaid = newTotalPaid;
                    status = newStatus;
                    paymentsHistory = updatedPaymentsHistory;
                };

                loans.put(loanId, updatedLoan);
                #ok(payment)
            };
            case null {
                #err("Loan not found")
            };
        }
    };

    // Autonomous operations
    private func startAutomationTimer() {
        // Run automation checks every hour (3600 seconds)
        automationTimer := ?Timer.setTimer(#seconds(3600), func() : async () {
            await runAutomationTasks();
        });
    };

    private func runAutomationTasks() : async () {
        Debug.print("Running autonomous finance tasks...");
        
        // Check for overdue payments
        await checkOverduePayments();
        
        // Send payment reminders
        await sendPaymentReminders();
        
        // Update loan statuses
        await updateLoanStatuses();
        
        // Restart timer for next cycle
        startAutomationTimer();
    };

    private func checkOverduePayments() : async () {
        let now = Time.now();
        let allLoans = Array.fromIter(Map.vals(loans));
        
        for (loan in allLoans.vals()) {
            switch (loan.firstPaymentDue) {
                case (?dueDate) {
                    if (now > dueDate and loan.status == #Disbursed) {
                        let updatedLoan = { loan with status = #InRepayment };
                        loans.put(loan.id, updatedLoan);
                        Debug.print("Loan " # loan.id # " moved to repayment status");
                    };
                };
                case null {};
            };
        };
    };

    private func sendPaymentReminders() : async () {
        // In a real implementation, this would send notifications to students
        // For demo purposes, we'll just log the reminders
        let now = Time.now();
        let reminderThreshold = now + (7 * 24 * 60 * 60 * 1000_000_000); // 7 days in nanoseconds
        
        let allLoans = Array.fromIter(Map.vals(loans));
        for (loan in allLoans.vals()) {
            if (loan.status == #InRepayment or loan.status == #GracePeriod) {
                switch (loan.firstPaymentDue) {
                    case (?dueDate) {
                        if (dueDate <= reminderThreshold and dueDate > now) {
                            Debug.print("Payment reminder for loan " # loan.id # " due soon");
                        };
                    };
                    case null {};
                };
            };
        };
    };

    private func updateLoanStatuses() : async () {
        let now = Time.now();
        let allLoans = Array.fromIter(Map.vals(loans));
        
        for (loan in allLoans.vals()) {
            switch (loan.disbursedAt) {
                case (?disbursedTime) {
                    let gracePeriodEnd = disbursedTime + (loan.gracePeriodMonths * 30 * 24 * 60 * 60 * 1000_000_000);
                    
                    if (loan.status == #Disbursed and now >= gracePeriodEnd) {
                        let updatedLoan = { loan with status = #GracePeriod };
                        loans.put(loan.id, updatedLoan);
                    };
                };
                case null {};
            };
        };
    };

    private func schedulePaymentReminders(loanId: Text) : async () {
        // Create automation rule for payment reminders
        let ruleId = "REMINDER-" # loanId;
        let rule : AutomationRule = {
            id = ruleId;
            ruleType = #PaymentReminder;
            condition = "7 days before payment due";
            action = "Send payment reminder notification";
            isActive = true;
            lastExecuted = null;
        };
        
        automationRules.put(ruleId, rule);
    };

    private func setupDefaultAutomationRules() {
        // Default rule for disbursement notifications
        let disbursementRule : AutomationRule = {
            id = "DEFAULT-DISBURSEMENT";
            ruleType = #DisbursementRule;
            condition = "Loan approved";
            action = "Auto-disburse within 24 hours";
            isActive = true;
            lastExecuted = null;
        };
        automationRules.put("DEFAULT-DISBURSEMENT", disbursementRule);
    };

    // Utility functions
    private func calculateMonthlyPayment(principal: Nat, annualRate: Float, termMonths: Nat) : Nat {
        if (annualRate == 0.0) {
            principal / termMonths
        } else {
            let monthlyRate = annualRate / 12.0;
            let factor = Float.pow(1.0 + monthlyRate, Float.fromInt(termMonths));
            let payment = Float.fromInt(principal) * monthlyRate * factor / (factor - 1.0);
            Int.abs(Float.toInt(payment))
        }
    };

    // Query functions
    public query func getLoan(loanId: Text) : async ?Loan {
        loans.get(loanId)
    };

    public query func getStudentLoans(studentId: Principal) : async [Loan] {
        let allLoans = Array.fromIter(Map.vals(loans));
        Array.filter<Loan>(allLoans, func(loan) = loan.studentId == studentId)
    };

    public query func getPaymentHistory(loanId: Text) : async [Payment] {
        let allPayments = Array.fromIter(Map.vals(payments));
        Array.filter<Payment>(allPayments, func(payment) = payment.loanId == loanId)
    };

    public query func getPortfolioStats() : async {
        totalLoans: Nat;
        totalDisbursed: Nat;
        totalRepaid: Nat;
        activeLoans: Nat;
        defaultedLoans: Nat;
    } {
        let allLoans = Array.fromIter(Map.vals(loans));
        let disbursedLoans = Array.filter<Loan>(allLoans, func(loan) = loan.status != #Approved);
        let activeLoans = Array.filter<Loan>(allLoans, func(loan) = loan.status == #InRepayment or loan.status == #GracePeriod);
        let defaultedLoans = Array.filter<Loan>(allLoans, func(loan) = loan.status == #Defaulted);
        
        let totalDisbursed = Array.foldLeft<Loan, Nat>(disbursedLoans, 0, func(acc, loan) = acc + loan.principalAmount);
        let totalRepaid = Array.foldLeft<Loan, Nat>(allLoans, 0, func(acc, loan) = acc + loan.totalPaid);

        {
            totalLoans = allLoans.size();
            totalDisbursed = totalDisbursed;
            totalRepaid = totalRepaid;
            activeLoans = activeLoans.size();
            defaultedLoans = defaultedLoans.size();
        }
    };
}

// ExpenseAI Pro - JavaScript Functionality

class ExpenseAI {
    constructor() {
        this.expenses = JSON.parse(localStorage.getItem('expenses')) || [];
        this.budget = JSON.parse(localStorage.getItem('budget')) || { monthly: 0, categories: {} };
        this.charts = {};
        this.aiInsights = [];
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateStats();
        this.renderExpenses();
        this.initCharts();
        this.generateAIInsights();
        this.loadSampleData();
    }

    bindEvents() {
        // Form submission
        document.getElementById('expenseForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addExpense();
        });

        // Receipt upload
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('receiptUpload');
        
        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#667eea';
        });
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = '#cbd5e0';
        });
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#cbd5e0';
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.processReceipt(files[0]);
            }
        });
        
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.processReceipt(e.target.files[0]);
            }
        });

        // Budget modal
        document.getElementById('setBudgetBtn').addEventListener('click', () => {
            this.openBudgetModal();
        });
        
        document.getElementById('closeBudgetModal').addEventListener('click', () => {
            this.closeBudgetModal();
        });
        
        document.getElementById('budgetForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveBudget();
        });

        // Category filter
        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.filterExpenses(e.target.value);
        });

        // Time filter for trends
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.updateTrendsChart(parseInt(e.target.dataset.period));
            });
        });

        // Modal close on outside click
        document.getElementById('budgetModal').addEventListener('click', (e) => {
            if (e.target.id === 'budgetModal') {
                this.closeBudgetModal();
            }
        });
    }

    addExpense() {
        const amount = parseFloat(document.getElementById('amount').value);
        const category = document.getElementById('category').value;
        const description = document.getElementById('description').value;

        const expense = {
            id: Date.now(),
            amount,
            category,
            description,
            date: new Date().toISOString(),
            source: 'manual'
        };

        this.expenses.unshift(expense);
        this.saveData();
        this.updateStats();
        this.renderExpenses();
        this.updateCharts();
        this.generateAIInsights();
        
        // Reset form
        document.getElementById('expenseForm').reset();
        
        // Show success animation
        this.showNotification('Expense added successfully!', 'success');
    }

    async processReceipt(file) {
        const uploadArea = document.getElementById('uploadArea');
        const processingStatus = document.getElementById('processingStatus');
        
        // Show processing state
        uploadArea.style.display = 'none';
        processingStatus.style.display = 'block';
        
        // Simulate AI OCR processing
        await this.simulateOCRProcessing();
        
        // Generate mock expense data from receipt
        const mockExpense = this.generateMockExpenseFromReceipt(file.name);
        
        // Add the expense
        this.expenses.unshift(mockExpense);
        this.saveData();
        this.updateStats();
        this.renderExpenses();
        this.updateCharts();
        this.generateAIInsights();
        
        // Reset upload area
        uploadArea.style.display = 'block';
        processingStatus.style.display = 'none';
        
        this.showNotification('Receipt processed successfully!', 'success');
    }

    async simulateOCRProcessing() {
        // Simulate AI processing time
        return new Promise(resolve => {
            setTimeout(resolve, 2000 + Math.random() * 2000);
        });
    }

    generateMockExpenseFromReceipt(filename) {
        const mockData = [
            { amount: 45.67, category: 'food', description: 'Restaurant dinner', merchant: 'Olive Garden' },
            { amount: 12.99, category: 'food', description: 'Coffee and pastry', merchant: 'Starbucks' },
            { amount: 89.45, category: 'shopping', description: 'Grocery shopping', merchant: 'Whole Foods' },
            { amount: 25.00, category: 'transport', description: 'Gas station', merchant: 'Shell' },
            { amount: 15.50, category: 'entertainment', description: 'Movie tickets', merchant: 'AMC Theaters' },
            { amount: 67.89, category: 'utilities', description: 'Electric bill', merchant: 'ConEd' },
            { amount: 120.00, category: 'healthcare', description: 'Pharmacy', merchant: 'CVS' }
        ];
        
        const randomExpense = mockData[Math.floor(Math.random() * mockData.length)];
        
        return {
            id: Date.now(),
            amount: randomExpense.amount,
            category: randomExpense.category,
            description: randomExpense.description,
            merchant: randomExpense.merchant,
            date: new Date().toISOString(),
            source: 'ocr',
            confidence: 0.95 + Math.random() * 0.05
        };
    }

    updateStats() {
        const totalExpenses = this.expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const budgetUsed = this.budget.monthly > 0 ? (totalExpenses / this.budget.monthly * 100) : 0;
        
        document.getElementById('totalExpenses').textContent = `$${totalExpenses.toFixed(2)}`;
        document.getElementById('budgetUsed').textContent = `${budgetUsed.toFixed(1)}%`;
        document.getElementById('aiInsights').textContent = this.aiInsights.length;
    }

    renderExpenses() {
        const expensesList = document.getElementById('expensesList');
        
        if (this.expenses.length === 0) {
            expensesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-receipt"></i>
                    <p>No expenses yet. Add your first expense above!</p>
                </div>
            `;
            return;
        }

        const expensesHTML = this.expenses.map(expense => {
            const date = new Date(expense.date);
            const categoryIcons = {
                food: 'fa-utensils',
                transport: 'fa-car',
                utilities: 'fa-bolt',
                entertainment: 'fa-film',
                healthcare: 'fa-heartbeat',
                shopping: 'fa-shopping-bag',
                other: 'fa-question'
            };

            return `
                <div class="expense-item">
                    <div class="expense-info">
                        <div class="expense-icon ${expense.category}">
                            <i class="fas ${categoryIcons[expense.category] || 'fa-question'}"></i>
                        </div>
                        <div class="expense-details">
                            <h4>${expense.description}</h4>
                            <p>${expense.merchant || this.getCategoryName(expense.category)} ${expense.source === 'ocr' ? '• AI Processed' : ''}</p>
                        </div>
                    </div>
                    <div class="expense-right">
                        <div class="expense-amount">$${expense.amount.toFixed(2)}</div>
                        <div class="expense-date">${date.toLocaleDateString()}</div>
                    </div>
                </div>
            `;
        }).join('');

        expensesList.innerHTML = expensesHTML;
    }

    filterExpenses(category) {
        const filteredExpenses = category === 'all' ? this.expenses : 
            this.expenses.filter(expense => expense.category === category);
        
        const expensesList = document.getElementById('expensesList');
        
        if (filteredExpenses.length === 0) {
            expensesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-filter"></i>
                    <p>No expenses found for this category.</p>
                </div>
            `;
            return;
        }

        // Re-render with filtered data
        const originalExpenses = this.expenses;
        this.expenses = filteredExpenses;
        this.renderExpenses();
        this.expenses = originalExpenses;
    }

    initCharts() {
        this.initBudgetChart();
        this.initTrendsChart();
    }

    initBudgetChart() {
        const ctx = document.getElementById('budgetChart').getContext('2d');
        
        const categoryTotals = this.getCategoryTotals();
        const categories = Object.keys(categoryTotals);
        const amounts = Object.values(categoryTotals);
        
        this.charts.budget = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categories.map(cat => this.getCategoryName(cat)),
                datasets: [{
                    data: amounts,
                    backgroundColor: [
                        '#48bb78', '#4299e1', '#ed8936', '#9f7aea',
                        '#f56565', '#38b2ac', '#a0aec0'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }

    initTrendsChart() {
        const ctx = document.getElementById('trendsChart').getContext('2d');
        
        const trendData = this.getTrendData(7);
        
        this.charts.trends = new Chart(ctx, {
            type: 'line',
            data: {
                labels: trendData.labels,
                datasets: [{
                    label: 'Daily Spending',
                    data: trendData.data,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(0);
                            }
                        }
                    }
                }
            }
        });
    }

    updateCharts() {
        this.updateBudgetChart();
        this.updateTrendsChart(7);
    }

    updateBudgetChart() {
        const categoryTotals = this.getCategoryTotals();
        const categories = Object.keys(categoryTotals);
        const amounts = Object.values(categoryTotals);
        
        this.charts.budget.data.labels = categories.map(cat => this.getCategoryName(cat));
        this.charts.budget.data.datasets[0].data = amounts;
        this.charts.budget.update();
    }

    updateTrendsChart(days) {
        const trendData = this.getTrendData(days);
        
        this.charts.trends.data.labels = trendData.labels;
        this.charts.trends.data.datasets[0].data = trendData.data;
        this.charts.trends.update();
    }

    getCategoryTotals() {
        const totals = {};
        this.expenses.forEach(expense => {
            totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
        });
        return totals;
    }

    getTrendData(days) {
        const labels = [];
        const data = [];
        const now = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            
            const dayExpenses = this.expenses.filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate.toDateString() === date.toDateString();
            });
            
            const dayTotal = dayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
            
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            data.push(dayTotal);
        }
        
        return { labels, data };
    }

    generateAIInsights() {
        this.aiInsights = [];
        
        if (this.expenses.length === 0) {
            this.renderInsights();
            return;
        }

        // Spending pattern analysis
        const categoryTotals = this.getCategoryTotals();
        const totalSpent = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
        const topCategory = Object.keys(categoryTotals).reduce((a, b) => 
            categoryTotals[a] > categoryTotals[b] ? a : b
        );

        // Budget analysis
        if (this.budget.monthly > 0) {
            const budgetUsed = (totalSpent / this.budget.monthly) * 100;
            
            if (budgetUsed > 90) {
                this.aiInsights.push({
                    type: 'warning',
                    icon: 'fa-exclamation-triangle',
                    message: `You've used ${budgetUsed.toFixed(1)}% of your monthly budget. Consider reducing spending.`
                });
            } else if (budgetUsed > 75) {
                this.aiInsights.push({
                    type: 'warning',
                    icon: 'fa-chart-line',
                    message: `You're at ${budgetUsed.toFixed(1)}% of your monthly budget. Monitor your spending closely.`
                });
            } else {
                this.aiInsights.push({
                    type: 'success',
                    icon: 'fa-check-circle',
                    message: `Great job! You're at ${budgetUsed.toFixed(1)}% of your monthly budget.`
                });
            }
        }

        // Category insights
        const categoryPercentage = (categoryTotals[topCategory] / totalSpent) * 100;
        this.aiInsights.push({
            type: 'info',
            icon: 'fa-chart-pie',
            message: `${this.getCategoryName(topCategory)} accounts for ${categoryPercentage.toFixed(1)}% of your spending.`
        });

        // Spending frequency
        const recentExpenses = this.expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return expenseDate >= weekAgo;
        });

        if (recentExpenses.length > 10) {
            this.aiInsights.push({
                type: 'warning',
                icon: 'fa-clock',
                message: `You've made ${recentExpenses.length} transactions this week. Consider consolidating purchases.`
            });
        }

        // OCR insights
        const ocrExpenses = this.expenses.filter(expense => expense.source === 'ocr');
        if (ocrExpenses.length > 0) {
            const avgConfidence = ocrExpenses.reduce((sum, expense) => sum + (expense.confidence || 0), 0) / ocrExpenses.length;
            this.aiInsights.push({
                type: 'info',
                icon: 'fa-robot',
                message: `AI processed ${ocrExpenses.length} receipts with ${(avgConfidence * 100).toFixed(1)}% accuracy.`
            });
        }

        // Predictive insights
        if (this.expenses.length >= 5) {
            const avgDaily = totalSpent / Math.max(1, this.getDaysWithExpenses());
            const projectedMonthly = avgDaily * 30;
            
            if (this.budget.monthly > 0 && projectedMonthly > this.budget.monthly) {
                const overage = projectedMonthly - this.budget.monthly;
                this.aiInsights.push({
                    type: 'warning',
                    icon: 'fa-crystal-ball',
                    message: `Based on current spending, you may exceed your budget by $${overage.toFixed(2)} this month.`
                });
            }
        }

        this.renderInsights();
    }

    renderInsights() {
        const container = document.getElementById('insightsContainer');
        
        if (this.aiInsights.length === 0) {
            container.innerHTML = `
                <div class="insight-item">
                    <i class="fas fa-info-circle"></i>
                    <p>Add some expenses to get AI-powered insights!</p>
                </div>
            `;
            return;
        }

        const insightsHTML = this.aiInsights.map(insight => `
            <div class="insight-item ${insight.type}">
                <i class="fas ${insight.icon}"></i>
                <p>${insight.message}</p>
            </div>
        `).join('');

        container.innerHTML = insightsHTML;
    }

    getDaysWithExpenses() {
        const dates = new Set();
        this.expenses.forEach(expense => {
            const date = new Date(expense.date).toDateString();
            dates.add(date);
        });
        return dates.size;
    }

    openBudgetModal() {
        const modal = document.getElementById('budgetModal');
        modal.classList.add('active');
        
        // Pre-fill current budget values
        document.getElementById('monthlyBudget').value = this.budget.monthly || '';
        document.getElementById('foodBudget').value = this.budget.categories.food || '';
        document.getElementById('transportBudget').value = this.budget.categories.transport || '';
        document.getElementById('entertainmentBudget').value = this.budget.categories.entertainment || '';
    }

    closeBudgetModal() {
        const modal = document.getElementById('budgetModal');
        modal.classList.remove('active');
    }

    saveBudget() {
        const monthlyBudget = parseFloat(document.getElementById('monthlyBudget').value) || 0;
        const foodBudget = parseFloat(document.getElementById('foodBudget').value) || 0;
        const transportBudget = parseFloat(document.getElementById('transportBudget').value) || 0;
        const entertainmentBudget = parseFloat(document.getElementById('entertainmentBudget').value) || 0;

        this.budget = {
            monthly: monthlyBudget,
            categories: {
                food: foodBudget,
                transport: transportBudget,
                entertainment: entertainmentBudget
            }
        };

        this.saveData();
        this.updateStats();
        this.generateAIInsights();
        this.closeBudgetModal();
        
        this.showNotification('Budget updated successfully!', 'success');
    }

    getCategoryName(category) {
        const names = {
            food: 'Food & Dining',
            transport: 'Transportation',
            utilities: 'Utilities',
            entertainment: 'Entertainment',
            healthcare: 'Healthcare',
            shopping: 'Shopping',
            other: 'Other'
        };
        return names[category] || 'Other';
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add notification styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#48bb78' : '#667eea'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    loadSampleData() {
        // Load sample data if no expenses exist
        if (this.expenses.length === 0) {
            const sampleExpenses = [
                {
                    id: Date.now() - 86400000,
                    amount: 45.67,
                    category: 'food',
                    description: 'Lunch at downtown cafe',
                    date: new Date(Date.now() - 86400000).toISOString(),
                    source: 'manual'
                },
                {
                    id: Date.now() - 172800000,
                    amount: 89.99,
                    category: 'shopping',
                    description: 'Weekly groceries',
                    date: new Date(Date.now() - 172800000).toISOString(),
                    source: 'ocr',
                    confidence: 0.97,
                    merchant: 'Whole Foods'
                },
                {
                    id: Date.now() - 259200000,
                    amount: 25.00,
                    category: 'transport',
                    description: 'Gas station fill-up',
                    date: new Date(Date.now() - 259200000).toISOString(),
                    source: 'manual'
                }
            ];
            
            this.expenses = sampleExpenses;
            this.saveData();
            this.updateStats();
            this.renderExpenses();
            this.updateCharts();
            this.generateAIInsights();
        }
    }

    saveData() {
        localStorage.setItem('expenses', JSON.stringify(this.expenses));
        localStorage.setItem('budget', JSON.stringify(this.budget));
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ExpenseAI();
});
let chartInstance = null;

async function loadStatistics() {

    const currentUser = auth.currentUser;

    if (!currentUser) return;

    const role =
        await getCurrentUserRole(currentUser.uid);

    db.ref("expenses").on("value", snapshot => {

        let expenses = [];

        snapshot.forEach(item => {

            const expense = item.val();

            if (
                role !== "owner" &&
                expense.uid !== currentUser.uid
            ) {
                return;
            }

            expenses.push(expense);

        });

        calculateStatistics(expenses);

        drawChart(expenses);

    });

}

function calculateStatistics(expenses) {

    const now = new Date();

    let today = 0;
    let week = 0;
    let month = 0;
    let year = 0;

    expenses.forEach(exp => {

        const d = new Date(exp.createdAt);

        if (
            d.toDateString() === now.toDateString()
        ) {
            today += Number(exp.amount);
        }

        const diffDays =
            (now - d) / (1000 * 60 * 60 * 24);

        if (diffDays <= 7) {
            week += Number(exp.amount);
        }

        if (
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear()
        ) {
            month += Number(exp.amount);
        }

        if (
            d.getFullYear() === now.getFullYear()
        ) {
            year += Number(exp.amount);
        }

    });

    document.getElementById("todayTotal").textContent =
        today.toLocaleString();

    document.getElementById("weekTotal").textContent =
        week.toLocaleString();

    document.getElementById("monthTotal").textContent =
        month.toLocaleString();

    document.getElementById("yearTotal").textContent =
        year.toLocaleString();

}

function drawChart(expenses) {

    let grouped = {};

    expenses.forEach(exp => {

        const date =
            new Date(exp.createdAt)
            .toLocaleDateString("ar-EG");

        if (!grouped[date]) {
            grouped[date] = 0;
        }

        grouped[date] += Number(exp.amount);

    });

    const labels = Object.keys(grouped);
    const values = Object.values(grouped);

    const canvas =
        document.getElementById("expensesChart");

    if (!canvas) return;

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(canvas, {

        type: "bar",

        data: {

            labels,

            datasets: [{

                label: "المصروفات",

                data: values

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false

        }

    });

}

const saveExpenseBtn = document.getElementById("saveExpense");
const expensesTable = document.getElementById("expensesTable");
const searchInput = document.getElementById("searchInput");

let expensesCache = [];

saveExpenseBtn.addEventListener("click", async () => {

    const user = auth.currentUser;

    if (!user) {
        alert("يجب تسجيل الدخول");
        return;
    }

    const amount = Number(
        document.getElementById("amount").value
    );

    const reason =
        document.getElementById("reason").value.trim();

    const receiptFile =
        document.getElementById("receipt").files[0];

    if (!amount || !reason) {
        alert("أدخل جميع البيانات");
        return;
    }

    try {

        let receiptUrl = "";

        if (receiptFile) {

            const fileName =
                Date.now() + "_" + receiptFile.name;

            const storageRef = storage
                .ref("receipts/" + fileName);

            await storageRef.put(receiptFile);

            receiptUrl =
                await storageRef.getDownloadURL();

        }

        const expenseData = {

            amount: amount,

            reason: reason,

            receiptUrl: receiptUrl,

            userName: user.displayName,

            uid: user.uid,

            approved: false,

            createdAt: new Date().toISOString()

        };

        await db
            .ref("expenses")
            .push(expenseData);

        document.getElementById("amount").value = "";
        document.getElementById("reason").value = "";
        document.getElementById("receipt").value = "";

        alert("تم حفظ المصروف");

    } catch (err) {

        console.error(err);

        alert("حدث خطأ أثناء الحفظ");

    }

});

async function loadExpenses() {

    const currentUser = auth.currentUser;

    const role =
        await getCurrentUserRole(currentUser.uid);

    db.ref("expenses")
        .on("value", snapshot => {

            expensesCache = [];

            snapshot.forEach(item => {

                const expense = item.val();

                expense.id = item.key;

                if (
                    role !== "owner" &&
                    expense.uid !== currentUser.uid
                ) {
                    return;
                }

                expensesCache.push(expense);

            });

            renderExpenses(expensesCache);

        });

}

function renderExpenses(data) {

    expensesTable.innerHTML = "";

    data.sort((a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    );

    data.forEach(expense => {

        const tr = document.createElement("tr");

        tr.innerHTML = `

<td>
${new Date(expense.createdAt)
.toLocaleDateString("ar-EG")}
</td>

<td>${expense.userName}</td>

<td>${expense.reason}</td>

<td>${expense.amount}</td>

<td>

<button
onclick="editExpense('${expense.id}')"
class="btn-primary">
تعديل
</button>

<button
onclick="deleteExpense('${expense.id}')"
class="btn-danger">
حذف
</button>

${expense.receiptUrl ?

`<a href="${expense.receiptUrl}"
target="_blank">
📎 فاتورة
</a>`

: ""}

</td>

`;

        expensesTable.appendChild(tr);

    });

}

async function deleteExpense(id) {

    const user = auth.currentUser;

    const owner = await isOwner(user.uid);

    if (!owner) {
        alert("غير مصرح");
        return;
    }

    const ok = confirm("حذف المصروف؟");

    if (!ok) return;

    await db
        .ref("expenses/" + id)
        .remove();

}

async function editExpense(id) {

    const user = auth.currentUser;

    const owner = await isOwner(user.uid);

    if (!owner) {
        alert("غير مصرح");
        return;
    }

    const amount =
        prompt("المبلغ الجديد");

    if (!amount) return;

    const reason =
        prompt("سبب الصرف");

    await db
        .ref("expenses/" + id)
        .update({

            amount: Number(amount),

            reason: reason

        });

}

searchInput.addEventListener("keyup", () => {

    const keyword =
        searchInput.value.toLowerCase();

    const filtered =
        expensesCache.filter(exp => {

            return (
                exp.reason
                .toLowerCase()
                .includes(keyword)

                ||

                exp.userName
                .toLowerCase()
                .includes(keyword)

                ||

                String(exp.amount)
                .includes(keyword)

            );

        });

    renderExpenses(filtered);

});

async function approveExpense(id) {

    const user = auth.currentUser;

    const owner = await isOwner(user.uid);

    if (!owner) return;

    await db
        .ref("expenses/" + id)
        .update({

            approved: true

        });

}

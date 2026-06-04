import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getDatabase,
ref,
push,
onValue
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

import {
getAuth,
FacebookAuthProvider,
signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
apiKey: "YOUR_API_KEY",
authDomain: "book-d1f7a.firebaseapp.com",
databaseURL: "https://book-d1f7a-default-rtdb.firebaseio.com",
projectId: "book-d1f7a",
storageBucket: "book-d1f7a.firebasestorage.app",
messagingSenderId: "546066419091",
appId: "1:546066419091:web:1fdb1b1d7278d19aa26c66"
};

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);

const auth = getAuth(app);

let currentUser = null;

window.loginFacebook = async function(){

const provider = new FacebookAuthProvider();

try{

const result = await signInWithPopup(auth, provider);

currentUser = result.user;

document.getElementById("username").innerText =
currentUser.displayName;

}catch(err){

alert(err.message);

}

};

window.saveExpense = async function(){

if(!currentUser){
alert("سجل الدخول أولاً");
return;
}

const amount =
document.getElementById("amount").value;

const reason =
document.getElementById("reason").value;

await push(ref(db,"expenses"),{

amount:Number(amount),

reason,

user:currentUser.displayName,

uid:currentUser.uid,

date:new Date().toISOString()

});

};

onValue(ref(db,"expenses"),(snapshot)=>{

const table =
document.getElementById("expensesTable");

table.innerHTML="";

let daily=0;
let weekly=0;
let monthly=0;

snapshot.forEach(item=>{

const data=item.val();

const tr=document.createElement("tr");

tr.innerHTML=`
<td>${new Date(data.date).toLocaleDateString()}</td>
<td>${data.user}</td>
<td>${data.reason}</td>
<td>${data.amount}</td>
`;

table.appendChild(tr);

daily += Number(data.amount);
weekly += Number(data.amount);
monthly += Number(data.amount);

});

document.getElementById("daily").innerText=daily;
document.getElementById("weekly").innerText=weekly;
document.getElementById("monthly").innerText=monthly;

});

window.exportExcel = function(){

const table =
document.querySelector("table");

const wb =
XLSX.utils.table_to_book(table,{sheet:"Expenses"});

XLSX.writeFile(wb,"expenses.xlsx");

};

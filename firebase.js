const firebaseConfig = {
    apiKey: "AIzaSyAHX0AvMRgnjMFCTUgFczoNO7bueQfCud4",
    authDomain: "book-d1f7a.firebaseapp.com",
    databaseURL: "https://book-d1f7a-default-rtdb.firebaseio.com",
    projectId: "book-d1f7a",
    storageBucket: "book-d1f7a.firebasestorage.app",
    messagingSenderId: "546066419091",
    appId: "1:546066419091:web:1fdb1b1d7278d19aa26c66",
    measurementId: "G-NXBS32CVEK"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();

async function createUserIfNotExists(user){

    const userRef = db.ref("users/" + user.uid);

    const snapshot = await userRef.once("value");

    if(snapshot.exists()) return;

    const usersSnapshot = await db.ref("users").once("value");

    let role = "user";

    if(!usersSnapshot.exists()){
        role = "owner";
    }

    await userRef.set({
        uid:user.uid,
        name:user.displayName || "",
        email:user.email || "",
        photo:user.photoURL || "",
        role:role,
        createdAt:new Date().toISOString()
    });

}

async function getCurrentUserRole(uid){

    const snapshot = await db
    .ref("users/" + uid + "/role")
    .once("value");

    return snapshot.val() || "user";

}

async function isOwner(uid){

    const role = await getCurrentUserRole(uid);

    return role === "owner";

}

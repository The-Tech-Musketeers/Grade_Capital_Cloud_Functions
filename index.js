const express = require("express");
const admin = require("firebase-admin");
const { initializeApp } = require("firebase-admin/app");
var serviceAccount = require("./grade-capital-firebase-adminsdk-dx5yp-a8ada747a9.json");
const app = express();

initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));

//  url is http://localhost:3000/onmeta?orderId=657701144d68ae541b9fde78
app.get("/onmeta", async (req, res) => {
  const orderId = req.query.orderId;
  if (!orderId) {
    res.status(400).send({ error: "Missing order id" });
    return;
  }
  var isValid = await isValidOrder(orderId);
  if (!isValid) {
    res.status(400).send({ error: "Invalid order id" });
  } else {
    await updateTransaction(orderId, { cryptoSwap: "completed" });
    res.status(200).send({ status: "success" });
  }
});

async function isValidOrder(orderId) {
  const db = admin.firestore();
  const docRef = db.collection("transactions").doc(orderId);
  const doc = await docRef.get();

  if (!doc.exists) {
    console.log("No such document!");
    return false;
  } else {
    console.log("Document data:", doc.data());
    return true;
  }
}

async function updateTransaction(orderId, value) {
  const db = admin.firestore();
  const docRef = db.collection("transactions").doc(orderId);
  await docRef.update(value);
}

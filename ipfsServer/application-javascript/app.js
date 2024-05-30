/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

const utf8Decoder = new TextDecoder();
import { Gateway, Wallets } from "fabric-network";
import FabricCAServices from "fabric-ca-client";
import path from "path";
import CAUtil from "../../../test-application/javascript/CAUtil.js";
import AppUtil from "../../../test-application/javascript/AppUtil.js";

const {
  buildCAClient,
  registerAndEnrollUser,
  enrollAdmin,
} = CAUtil;

const {
  buildCCPOrg1,
  buildWallet,
} = AppUtil;

const channelName = process.env.CHANNEL_NAME || "mychannel";
const chaincodeName = process.env.CHAINCODE_NAME || "basic";
const __dirname = path.resolve();
const mspOrg1 = "Org1MSP";
const walletPath = path.join(__dirname, "wallet");
const org1UserId = "appUser" + Date.now();

function prettyJSONString(inputString) {
  return JSON.stringify(JSON.parse(inputString), null, 2);
}
export async function start() {
  const ccp = buildCCPOrg1();
  const caClient = buildCAClient(FabricCAServices, ccp, "ca.org1.example.com");
  const wallet = await buildWallet(Wallets, walletPath);
  await enrollAdmin(caClient, wallet, mspOrg1);
  await registerAndEnrollUser(
    caClient,
    wallet,
    mspOrg1,
    org1UserId,
    "org1.department1"
  );
  const gateway = new Gateway();
  await gateway.connect(ccp, {
    wallet,
    identity: org1UserId,
    discovery: { enabled: true, asLocalhost: true }, 
  });

  const network = await gateway.getNetwork(channelName);

  const contract = network.getContract(chaincodeName);
  console.log(
    "\n--> Submit Transaction: InitLedger, function creates the initial set of documents on the ledger"
  );
  await contract.submitTransaction("InitLedger");
  console.log("*** Result: committed");
  return contract
}

export async function getAllDocs(contract) {
  console.log("GetAllDocs: Gets all the documents in the ledger")
  const resultBytes = await contract.evaluateTransaction("GetAllDocuments");
  const resultJson = utf8Decoder.decode(resultBytes);
  const result = JSON.parse(resultJson);
  console.log("*** Result:", result);
  return result;
}

export async function createHash(contract, {doc}) {
  console.log(
    "\n--> Submit Transaction: CreateHash, creates new document with ID, Name, Pan Number and Hash"
  );
  const id = doc.id
  const name = doc.name
  const pNum = doc.pNum
  const filePath = doc.filePath
  console.log(id, name, pNum, filePath)
  const string = await contract.submitTransaction("CreateHashDoc", id, name, pNum, filePath);
  console.log("*** Transaction committed successfully", string);
}

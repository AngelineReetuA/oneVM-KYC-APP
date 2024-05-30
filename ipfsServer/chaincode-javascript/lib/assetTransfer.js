/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

// Deterministic JSON.stringify()
const stringify = require("json-stringify-deterministic");
const sortKeysRecursive = require("sort-keys-recursive");
const { Contract } = require("fabric-contract-api");

class AssetTransfer extends Contract {
  async InitLedger(ctx) {
    const hashs = [];

    for (const hash of hashs) {
      hash.docType = "hash";
      await ctx.stub.putState(
        hash.id,
        Buffer.from(stringify(sortKeysRecursive(hash)))
      );
    }
  }

  // CreateHashDoc issues a new Hash document to the world state with given details.
  async CreateHashDoc(ctx, id, name, pNum, hashValue) {
    const hash = {
      id: id,
      name: name,
      pNum: pNum,
      hashValue: hashValue,
    };
    hash.docType = "hash";
    // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
    await ctx.stub.putState(
      id,
      Buffer.from(stringify(sortKeysRecursive(hash)))
    );
    return JSON.stringify(hash);
  }

  // ReadHashDoc returns the document stored in the world state with given id.
  async ReadHashDoc(ctx, id) {
    const hashJSON = await ctx.stub.getState(id); // get the asset from chaincode state
    if (!hashJSON || hashJSON.length === 0) {
      throw new Error(`The hash does not exist`);
    }
    return hashJSON.toString();
  }

  // GetAllAssets returns all assets found in the world state.
  async GetAllDocuments(ctx) {
    const allResults = [];
    // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
    const iterator = await ctx.stub.getStateByRange("", "");
    console.log("Iterator: ", iterator);
    let result = await iterator.next();
    while (!result.done) {
      const strValue = Buffer.from(result.value.value.toString()).toString(
        "utf8"
      );
      console.log(strValue);
      let record;
      try {
        record = JSON.parse(strValue);
        console.log(record);
      } catch (err) {
        console.log(err);
        record = strValue;
      }
      allResults.push(record);
      result = await iterator.next();
    }
    console.log("All Results: ", allResults);
    return JSON.stringify(allResults);
  }
}

module.exports = AssetTransfer;

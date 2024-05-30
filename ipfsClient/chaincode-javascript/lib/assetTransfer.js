/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
'use strict';

const { Contract } = require('fabric-contract-api');

// MULTI LEDGER CONTRACT TESTING

class assetTransfer extends Contract {

    async initLedger(ctx) {
        // Initialize Ledger1
        console.info('============= START : Initialize Ledger1 ===========');
        const ledger1 = [
            {
                id: 'asset1',
                owner: 'Alice',
                value: 100,
            },
            {
                id: 'asset2',
                owner: 'Bob',
                value: 200,
            },
        ];

        for (const asset of ledger1) {
            await ctx.stub.putState(asset.id, Buffer.from(JSON.stringify(asset)), 'Ledger1');
            console.info(`Added ${asset.id} to Ledger1`);
        }
        console.info('============= END : Initialize Ledger1 ===========');

        // Initialize Ledger2
        console.info('============= START : Initialize Ledger2 ===========');
        const ledger2 = [
            {
                id: 'asset1',
                owner: 'Charlie',
                value: 300,
            },
            {
                id: 'asset2',
                owner: 'David',
                value: 400,
            },
        ];

        for (const asset of ledger2) {
            await ctx.stub.putState(asset.id, Buffer.from(JSON.stringify(asset)), 'Ledger2');
            console.info(`Added ${asset.id} to Ledger2`);
        }
        console.info('============= END : Initialize Ledger2 ===========');
    }

    async createAsset(ctx, id, owner, value, ledger) {
        console.info(`============= START : Create Asset on ${ledger} ===========`);

        const asset = {
            id,
            owner,
            value,
        };

        await ctx.stub.putState(id, Buffer.from(JSON.stringify(asset)), ledger);
        console.info(`Asset ${id} created on ${ledger}`);

        console.info(`============= END : Create Asset on ${ledger} ===========`);
    }

    async readAsset(ctx, id, ledger) {
        console.info(`============= START : Read Asset on ${ledger} ===========`);
        const assetBytes = await ctx.stub.getState(id, ledger);

        if (!assetBytes || assetBytes.length === 0) {
            throw new Error(`Asset ${id} not found on ${ledger}`);
        }

        console.info(`============= END : Read Asset on ${ledger} ===========`);
        return assetBytes.toString();
    }

    async getAllAssets(ctx, ledger) {
        console.info(`============= START : Get All Assets on ${ledger} ===========`);
        const iterator = await ctx.stub.getStateByPartialCompositeKey('', ledger);
        const allAssets = [];

        while (true) {
            const result = await iterator.next();

            if (result.value && result.value.value.toString()) {
                const asset = JSON.parse(result.value.value.toString('utf8'));
                allAssets.push(asset);
            }

            if (result.done) {
                await iterator.close();
                console.info(`============= END : Get All Assets on ${ledger} ===========`);
                return JSON.stringify(allAssets);
            }
        }
    }
}

module.exports = assetTransfer;

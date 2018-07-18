var bitcore = require("bitcore-lib");
var PublicKey = bitcore.PublicKey;
var Address = bitcore.Address;
var Networks = bitcore.Networks;
var explorers = require("bitcore-explorers");
var insight = new explorers.Insight(Networks.testnet);
var Transaction = bitcore.Transaction;
Networks.defaultNetwork = Networks.testnet;

// Global variables
var utxos;
var balance;

// Set constants
var TRANSACTION_AMOUNT = 20000;
var TRANSACTION_FEE = 1000;
var ORIGIN_STRING = "universidad de montevideo - 2";
var DESTINATION_STRING = "universidad de montevideo - 1";

// Create origin address from string.
var value = Buffer.from(ORIGIN_STRING);
var hash = bitcore.crypto.Hash.sha256(value);
var bn = bitcore.crypto.BN.fromBuffer(hash);
var privateKey = new bitcore.PrivateKey(bn);
var publicKey = PublicKey(privateKey);
var address = new Address(publicKey);

// Create destination address from string.
var destinationValue = Buffer.from(DESTINATION_STRING);
var destinationHash = bitcore.crypto.Hash.sha256(destinationValue);
var destinationBN = bitcore.crypto.BN.fromBuffer(destinationHash);
var destinationPrivateKey = new bitcore.PrivateKey(destinationBN);
var destinationPublicKey = new PublicKey(destinationPrivateKey);
var destinationAddress = new Address(destinationPublicKey);

// Print info.
console.log(address);
console.log(destinationAddress);

insight.getUnspentUtxos(address.toString(), function(err, auxUtxos) {
	if (err) {
		console.log(err);
	} else {
		utxos = auxUtxos;
		var amount = 0;
		var i;
		for (i = 0; i < utxos.length; i++) {
			amount += bitcore.Unit.fromBTC(utxos[i].toObject().amount).toSatoshis();
		}

		balance = amount;
		makeTransaction(destinationAddress, TRANSACTION_AMOUNT);
	}
})

function makeTransaction(destination, amount) {
	if (!utxos) {
		console.log("There are no transactions");
	} else if (balance >= amount) {
		// Sort Transactions from lowest to highest amount.
		utxos.sort(function(a,b) {return a.toObject().amount.toSatoshis - b.toObject().amount.toSatoshis });

		var transaction = new Transaction()
				.from(utxos)
				.to(destination.toString(),amount)
				.fee(TRANSACTION_FEE)
				.change(address.toString())
				.sign(privateKey);

		broadcast(transaction.serialize({ disableDustOutputs: true }));
	} else {
		console.log("You don't have enough money");
	}
}

// broadcast broadcasts the transaction passed as a parameter to the Network specified (testnet 
// in this case).
function broadcast(transaction){
	insight.broadcast(transaction, function(error, body) {
		if (error) {
			console.log("Error in broadcast: " + error);
		} else {
			console.log("Transaction id: " + body);
		}
	});
}

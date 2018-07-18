var express = require("express");
var app = express();

// Bitcoin needed variables
var bitcore = require('bitcore-lib');
var PublicKey = bitcore.PublicKey;
var Address = bitcore.Address;
var Networks = bitcore.Networks;
var explorers = require('bitcore-explorers');
var insight = new explorers.Insight(Networks.testnet);
var Transaction = bitcore.Transaction;

// makeTransaction makes a transaction to the destination 
// Global variables
var utxos;
var balance;

// Set constants
var TRANSACTION_AMOUNT;
var TRANSACTION_FEE;
var ORIGIN_STRING;
var DESTINATION_STRING;

// Create origin address from string.
var value;
var hash;
var bn;
var privateKey;
var publicKey;
var address;

// Create destination address from string.
var destinationValue;
var destinationHash;
var destinationBN;
var destinationPrivateKey;
var destinationPublicKey;
var destinationAddress;

Networks.defaultNetwork = Networks.testnet;

// Body parser
var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/address/new", function(req, res) {
	var value = Buffer.from(req.body.seed);
	var hash = bitcore.crypto.Hash.sha256(value);
	var bn = bitcore.crypto.BN.fromBuffer(hash);

	privateKey = new bitcore.PrivateKey(bn);
	var publicKey = PublicKey(privateKey);
	var address = new Address(publicKey);
	ORIGIN_STRING = address;

	res.send({"address": address.toString(), "privateKey": privateKey.toString(), "publicKey": publicKey.toString()})
})

app.get('/address/:address', function(req, res) {

	// Get address
	var address = req.params.address

	insight.getUnspentUtxos(address, function(err, utxos) {

		if (err) {
			res.send({"error": err})
		} else {
			var amount = 0;
			var i;
			for (i = 0; i < utxos.length; i++) {
				amount += bitcore.Unit.fromBTC(utxos[i].toObject().amount).toSatoshis();
			}

			balance = amount;

			res.send({"balance": balance, "unspentUtxo": utxos})
		}
	})
})

app.post('/transaction', function(req, res) {
	LlamadaHacerTransaccion(req.body.dir, req.body.cant)
})

function LlamadaHacerTransaccion(destino, cantidad){

	 TRANSACTION_FEE = 3000;
	 DESTINATION_STRING = "universidad de montevideo - 1";


	// Create destination address from string.
	/*
	destinationValue = Buffer.from(DESTINATION_STRING);
	destinationHash = bitcore.crypto.Hash.sha256(destinationValue);
	destinationBN = bitcore.crypto.BN.fromBuffer(destinationHash);
	destinationPrivateKey = new bitcore.PrivateKey(destinationBN);
	destinationPublicKey = new PublicKey(destinationPrivateKey);
	destinationAddress = new Address(destinationPublicKey);
	*/
	destinationAddress = destino;
	TRANSACTION_AMOUNT = cantidad;
	address = ORIGIN_STRING;
// Print info.
console.log("origen: "+ address);
console.log("destino: " + destinationAddress);
console.log("cantidad: " + cantidad);

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
}

function makeTransaction(destination, amount) {
	//console.log(amount);
	if (!utxos) {
		console.log("There are no transactions");
	} else if (balance >= amount) {
		// Sort Transactions from lowest to highest amount.
		utxos.sort(function(a,b) {return a.toObject().amount.toSatoshis - b.toObject().amount.toSatoshis });
		var transaction = new Transaction()
				.from(utxos)
				.to(destination.toString(),parseInt(amount))
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

// Serve static files under folder www
app.use(express.static('www'))

app.listen(3000, () => console.log('App listening on port 3000!'))




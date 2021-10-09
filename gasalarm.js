import sound from "sound-play";
import etherscanApi from "etherscan-api";
import prompt from "prompt-sync";

var api = etherscanApi.init(""); // enter etherscan api key if you have one.

const pollRate = 30; // polling rate in seconds

const convHexWeiToGwei = (hexWei) => parseInt(hexWei, 16) / 10 ** 9;

const getGasPrice = async () => {
	let gasPriceData = await api.proxy.eth_gasPrice();
	let gweiGas = convHexWeiToGwei(gasPriceData.result);
	console.log(`gas price: ${gweiGas} gwei`);
	return gweiGas;
};

const checkLoop = (alarm) => {
	let pass = 0;

	const requestPrice = async () => {
		pass += 1;

		console.log(`sending request ${pass}`);
		let price = await getGasPrice();

		if (price <= alarm) {
			console.log(
				`=============== gas price is ${price} gwei, ${
					alarm - price
				} cheaper than alarm`
			);

			sound.play("C:/Opus/gas/asdf.wav", 1);
		}
	};

	requestPrice();
	setInterval(() => requestPrice(), pollRate * 1000);
};

const main = () => {
	console.log("enter desired gas price for alarm or skip");
	var alarmCheck = new prompt();
	const treshold = parseInt(alarmCheck("gas price in gwei: "));

	if (!Number.isInteger(treshold) || treshold === 0) {
		console.log("running without alarm...");
		checkLoop(0);
	} else {
		console.log(
			`alarm set at ${treshold} gwei (polling rate: ${pollRate} sec.)`
		);
		checkLoop(treshold);
	}
};

main();

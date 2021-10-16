import sound from "sound-play";
import prompt from "prompt-sync";
import WebSocket from "ws";

const filePath = new URL("./asdf.wav", import.meta.url).href;
const convWeiToGwei = (wei) => wei / 10 ** 9;
const parseTime = (e) => new Date(e).toUTCString().replace("GMT", "UTC");

const main = () => {
	let alarm;

	if (!process.platform === "linux") {
		console.log("enter desired gas price for alarm or skip");
		var alarmCheck = new prompt();
		const threshold = parseInt(
			alarmCheck("gas price in gwei (standard speed): ")
		);

		if (!Number.isInteger(threshold) || threshold === 0) {
			console.log("running without alarm...");
			alarm = false;
		} else {
			console.log(`alarm set at ${threshold} gwei`);
			alarm = true;
		}
	}
	alarm = false;
	const socket = new WebSocket("wss://gasgas.io/prices");

	socket.onopen = (e) => {
		console.log("websocket connected");
	};

	socket.onmessage = (e) => {
		let prices = Object.values(JSON.parse(e.data).data).map(
			(value, index) => {
				return index === 4
					? parseTime(value)
					: convWeiToGwei(value).toFixed(1);
			}
		);

		console.log(`Data received at ${prices[4]}`);

		console.log(
			`|   rapid: ${prices[0]}   |   fast: ${prices[1]}   |   standard: ${prices[2]}   |   slow: ${prices[3]}   |`
		);

		if (alarm) {
			if (prices[2] <= threshold) {
				console.log(
					`=============== gas price is ${prices[2]} gwei, ${
						threshold - prices[2]
					} cheaper than alarm`
				);

				sound.play(filePath, 1);
			}
		}
	};

	socket.onclose = (e) => {
		if (e.wasClean) {
			console.log(
				`Connection closed cleanly, code=${e.code} reason=${e.reason}`
			);
		} else {
			console.log("Connection rekt");
		}
	};

	socket.onerror = (e) => {
		console.log({ e: e.message });
	};
};

main();

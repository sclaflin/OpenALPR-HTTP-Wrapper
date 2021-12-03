import Server from "./lib/Server.js";
import fs from 'fs/promises';
import YAML from 'yaml';

(async () => {
	const { port } = YAML.parse(
		(await fs.readFile('config.yaml'))
			.toString()
	);
	
	Server.fromObject({
		port: port || 3000
	});
})()


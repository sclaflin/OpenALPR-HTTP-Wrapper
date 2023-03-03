import fs from 'fs/promises';
import { Readable } from 'stream';
import { spawn } from 'child_process';
import randomString from './RandomString.js';


export const COUNTRY_CODE_AU = 'au';
export const COUNTRY_CODE_AUWIDE = 'auwide';
export const COUNTRY_CODE_BR = 'br';
export const COUNTRY_CODE_BR2 = 'br2';
export const COUNTRY_CODE_EU = 'eu';
export const COUNTRY_CODE_FR = 'fr';
export const COUNTRY_CODE_GB = 'gb';
export const COUNTRY_CODE_IN = 'in';
export const COUNTRY_CODE_KR = 'kr';
export const COUNTRY_CODE_KR2 = 'kr2';
export const COUNTRY_CODE_MX = 'mx';
export const COUNTRY_CODE_SG = 'sg';
export const COUNTRY_CODE_US = 'us';
export const COUNTRY_CODE_VN2 = 'vn2';

const COUNTRY_CODES = [
	COUNTRY_CODE_AU,
	COUNTRY_CODE_AUWIDE,
	COUNTRY_CODE_BR,
	COUNTRY_CODE_BR2,
	COUNTRY_CODE_EU,
	COUNTRY_CODE_FR,
	COUNTRY_CODE_GB,
	COUNTRY_CODE_IN,
	COUNTRY_CODE_KR,
	COUNTRY_CODE_KR2,
	COUNTRY_CODE_MX,
	COUNTRY_CODE_SG,
	COUNTRY_CODE_US,
	COUNTRY_CODE_VN2
];

export class OpenALPR {
	static async detectBuffer(buff, countryCode = 'us') {
		if (!(buff instanceof Buffer))
			throw new TypeError('buff must be an instance of Buffer.');
		
		if(COUNTRY_CODES.indexOf(countryCode) === -1)
			throw new TypeError('invalid country code.');

		// alpr only seems to care if the file extension is a known one
		// png, jpg, jpeg, bpm (others?) encoding works regardless
		const filePath = `/tmp/${randomString(32)}.jpeg`;
		await fs.writeFile(filePath, buff);

		// alpr looks like it requires a file on disk to read. Cannot pipe. :'(
		const ls = spawn('/usr/bin/alpr', ['--country', countryCode, '--json', filePath]);
		const out = [];
		const err = [];

		ls.stdout.on('data', (data) => out.push(data));
		ls.stderr.on('data', (data) => err.push(data));

		await new Promise((resolve, reject) => {
			ls.on('close', (code) => {
				if(code !== 0)
					return reject(new Error(Buffer.concat(err).toString('utf8')));
				return resolve();
			});
		});

		await fs.rm(filePath, { force: true });

		return JSON.parse(Buffer.concat(out).toString('utf8'));
	}
	static async detectFile(path, countryCode = 'us') {
		if (typeof path !== 'string')
			throw new TypeError('path must be a string.');
		return OpenALPR.detectBuffer(await fs.readFile(path), countryCode);
	}
	static async detectReadStream(rs, countryCode = 'us') {
		if(!(rs instanceof Readable))
			throw new TypeError('rs must be an instance of Readable.');
		
		const buffs = [];
		rs.on('data', buff => buffs.push(buff));
		await new Promise((resolve) => {
			rs.on('close', () => resolve());
		});
		
		return OpenALPR.detectBuffer(Buffer.concat(buffs), countryCode);
	}
}
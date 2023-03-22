import express from "express";
import multer from "multer";
import { OpenALPR } from './OpenALPR.js';

export default class Server {
	#app = null;
	#port = null;
	#server = null;

	constructor(port) {
		this.port = port;
		this.#app = express();

		const upload = multer();
		
		this.#app.get('/', (req, res) => this.home(req, res));
		this.#app.post('/detect', upload.single('upload'), 	(req, res) => this.detect(req, res));
		
		this.listen();
	}
	get port() {
		return this.#port;
	}
	set port(v) {
		if(!Number.isInteger(v))
			throw new TypeError('port must be an integer.');
		this.#port = v;
	}
	listen() {
		if(this.#server)
			throw new Error('Server is already listening.');
		this.#server = this.#app.listen(this.port);
	}
	close() {
		if(!this.#server)
			throw new Error('Server is not listening.');
		this.#server.close();
		this.#server = null;
	}
	home(req, res) {
		res.send(`
			<h1>OpenALPR HTTP Wrapper</h1>
			<p>This project is a thin wrapper around the <a href="https://github.com/openalpr/openalpr">OpenALPR</a> CLI binary.</p>
			<p>HTTP Posts to /detect require an "upload" and an optional "country_code" value.</p>
			<h2>Upload an image for License Plate Recognition</h2>
			<form action="/detect" method="POST" enctype="multipart/form-data">
				<select name="country_code">
					<option value="au">Australia</option>
					<option value="auwide">Australia Wide</option>
					<option value="br">Brazil</option>
					<option value="br2">Brazil Two Line</option>
					<option value="eu">Europe</option>
					<option value="fr">France</option>
					<option value="gb">United Kingdom</option>
					<option value="in">India</option>
					<option value="kr">South Korea</option>
					<option value="kr2">South Korea Two Line</option>
					<option value="mx">Mexico</option>
					<option value="sg">Singapore</option>
					<option value="us">United States</option>
					<option value="vn2">Vietnam Two Line</option>
				</select>
				
				<input type="file" name="upload">
				
				<input type="submit" value="Detect">
			</form>
		`);
	}
	async detect(req, res) {
		try {
			const data = await OpenALPR.detectBuffer(req.file.buffer, req.body.country_code, req.body.pattern);
			res.status(200).json(data);
		}
		catch(err) {
			res.status(500).json(err.message);
		}
	}
	
	static fromObject(obj) {
		if(obj === null || typeof obj !== 'object')
			throw new TypeError('obj must be an Object.');

		return new this(
			obj.port
		);
	}
}

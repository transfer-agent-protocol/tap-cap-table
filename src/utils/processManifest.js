import Busboy from "busboy";
import yauzl from "yauzl";

const processManifest = (req) => {
    return new Promise((resolve, reject) => {
        const arr = [];
        const busboy = Busboy({ headers: req.headers });

        busboy.on("file", (_, file, filename) => {
            const chunks = [];
            file.on("data", (data) => {
                chunks.push(data);
            });

            file.on("end", () => {
                const fileBuffer = Buffer.concat(chunks);
                yauzl.fromBuffer(fileBuffer, { lazyEntries: true }, (err, zipfile) => {
                    if (err) return reject(err);

                    zipfile.readEntry();
                    zipfile.on("entry", (entry) => {
                        if (/\/$/.test(entry.fileName)) {
                            zipfile.readEntry();
                        } else {
                            zipfile.openReadStream(entry, (err, readStream) => {
                                if (err) return reject(err);

                                const chunks = [];
                                readStream.on("data", (chunk) => {
                                    chunks.push(chunk);
                                });

                                readStream.on("end", () => {
                                    const fileData = Buffer.concat(chunks);
                                    if (fileData.length === 0) {
                                        console.error("Empty file detected:", entry.fileName);
                                    } else if (entry.fileName.endsWith("ocf.json")) {
                                        arr.push(JSON.parse(fileData.toString()));
                                    }
                                    zipfile.readEntry();
                                });

                                readStream.on("error", (error) => {
                                    reject(error);
                                });
                            });
                        }
                    });

                    zipfile.on("end", () => {
                        resolve(arr);
                    });
                });
            });
        });

        busboy.on("error", (err) => {
            reject(err);
        });

        req.pipe(busboy);
    });
};

export default processManifest;

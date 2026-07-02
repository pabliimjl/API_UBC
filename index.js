const express = require("express");
const axios = require("axios");
const cors = require("cors");
const { JSDOM } = require("jsdom");
const dns = require("node:dns");
const fs = require("fs");

dns.setDefaultResultOrder("ipv4first");

const app = express();
app.use(cors());

async function sleep(ms) {
    return new Promise(resolve =>
        setTimeout(resolve, ms)
    );
}

async function obtenerUBC(intentos = 5) {

    for (let i = 1; i <= intentos; i++) {

        try {

            const { data } = await axios.get(
                "https://www.cajadebioquimicos.org.ar/ubc.asp",
                {
                    timeout: 15000,
                    headers: {
                        "User-Agent":
                            "Mozilla/5.0"
                    }
                }
            );

            const dom = new JSDOM(data);

            const h4s = [
                ...dom.window.document.querySelectorAll("h4")
            ];

            const ubc = h4s.find(h =>
                h.textContent.includes("$")
            );

            if (!ubc) {
                throw new Error(
                    "No se encontró UBC"
                );
            }

            return ubc.textContent.trim();

        } catch (error) {

            if (i < intentos) {

                await sleep(3000);

            } else {

                throw error;
            }
        }
    }
}

app.get("/ubc", async (req, res) => {

    try {

        const ubc =
            await obtenerUBC();

        res.json({
            ok: true,
            ubc
        });

    } catch (error) {

        res.status(500).json({
            ok: false,
            error: error.message
        });
    }
});

app.get("/nbu", (req, res) => {

    try {

        const archivo =
            fs.readFileSync(
                "./nbu.json",
                "utf-8"
            );

        const datos =
            JSON.parse(archivo);

        res.json({
            ok: true,
            cantidad: datos.length,
            determinaciones: datos
        });

    } catch (error) {

        res.status(500).json({
            ok: false,
            error: error.message
        });
    }
});

app.get("/apb", (req, res) => {

    res.json({
        apb: 25000
    });

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});

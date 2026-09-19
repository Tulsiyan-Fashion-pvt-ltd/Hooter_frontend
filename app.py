from pathlib import Path
from quart import Quart, send_from_directory

app = Quart(
    __name__,
    static_folder="./dist"
)


@app.get("/api/hello")
async def hello():
    return {"message": "Hello"}


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
async def index(path=None):
    file = Path(app.static_folder) / path

    if path and file.is_file():
        return await send_from_directory(app.static_folder, path)

    return await send_from_directory(app.static_folder, "index.html")


if __name__ == "__main__":
	app.run(port=8810, debug=True)

import {spawn} from "child_process";
import fs from "fs";
import fse from "fs-extra";

const TARGET_SRC_DIR = "dist/webext-dev/src"

await new Promise((res, rej) => {
  const proc = spawn(
      "yarn",
      ["run", "parcel", "build", "src/manifest.json", "--target", "webext-dev"],
      {stdio: "inherit", shell: true}
  )
  proc.on("error", (err) => {
    rej(err)
  })
  proc.on("exit", (code) => {
    if (code === 0) {
      res()
    }
    else {
      rej(`Parcel build failed with code: ${code}`)
    }
  })
})

if (fs.existsSync(TARGET_SRC_DIR)) {
  await new Promise((res, rej) => {
    fse.remove(TARGET_SRC_DIR, (err) => {
      if (err) {
        rej(err)
      } else {
        res()
      }
    })
  })
}

fs.mkdirSync(TARGET_SRC_DIR, { recursive: true })

await new Promise((res, rej) => {
  fse.copy("src", TARGET_SRC_DIR, (err) => {
    if (err) {
      rej(err)
    } else {
      res()
    }
  })
})
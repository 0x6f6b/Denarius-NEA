const version = process.env.npm_package_version; // get version from package.json
console.log("Version " + version);

const buildInfo = document.getElementById("build-info");
buildInfo.innerHTML = "Denarius Build " + version; // display version in html

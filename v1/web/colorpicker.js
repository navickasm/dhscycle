const names = ["main", "bg", "text", "light", "link", "border", "pn", "othertext"];

for (n in names) {
  const ls = localStorage.getItem(names[n] + "color");
  console.log(ls);
  if (ls) {
    document.documentElement.style.setProperty("--" + names[n], ls);
    document.getElementById("cp" + names[n]).value = ls;
  }
}

function resetColor() {
  for (n in names) {
    localStorage.removeItem(names[n] + "color");
  }
  location.reload();
}

function updateColorStores() {
  for (n in names) {
    const colorHex = document.getElementById("cp" + names[n]).value;
    localStorage.setItem(names[n] + "color", colorHex);
    document.documentElement.style.setProperty("--" + names[n], colorHex);
  }
}

function updateColorStoresA(colors) {
  for (n in names) {
    const colorHex = colors[n];
    localStorage.setItem(names[n] + "color", colorHex);
    document.documentElement.style.setProperty("--" + names[n], colorHex);
    document.getElementById("cp" + names[n]).value = colors[n];
  }
}

function copy() {
  let code = "";
  for (n in names) {
    const colorHex = document.getElementById("cp" + names[n]).value;
    code += colorHex.substring(1, 7);
  }

  code = hexToBase64(code);
  navigator.clipboard.writeText(code);

  document.getElementById("copybutton").innerHTML = "Copied!";

  setTimeout(function() {
    document.getElementById("copybutton").innerHTML = "Copy Theme";
  }, 3000);
}

function importColor() {
  const importValues = document.getElementById("importprofile").value;
  const hexCodes = base64ToHex(importValues);

  arrayOfHex = hexCodes.match(/.{1,6}/g).map(i => "#" + i);

  console.log(arrayOfHex);

  updateColorStoresA(arrayOfHex);
}

function base64ToHex(str) {
  const raw = atob(str);
  let result = '';
  for (let i = 0; i < raw.length; i++) {
    const hex = raw.charCodeAt(i).toString(16);
    result += (hex.length === 2 ? hex : '0' + hex);
  }
  return result;
}

function hexToBase64(hexstring) {
  return btoa(hexstring.match(/\w{2}/g).map(function(a) {
    return String.fromCharCode(parseInt(a, 16));
  }).join(""));
}
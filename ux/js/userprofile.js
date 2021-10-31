var myHeaders = new Headers();
myHeaders.set('Cache-Control', 'no-store');
var urlParams = new URLSearchParams(window.location.search);
var tokens;
var domain = "autretechlabcloud";
var region = "eu-central-1";
var appClientId = "15m6qtnt2h45eibrn02p693311";
var userPoolId = "eu-central-1_ybmcg1P5X";
var redirectURI = "http://localhost:8080";

//https://atl-ux.s3.eu-central-1.amazonaws.com/mermaid_ide/auth.html?
//code=4699595b-c628-48c0-bbb7-1d03229c6a2c
//&state=0000000093425818140000005100055006875

//https://autretechlab.auth.eu-central-1.amazoncognito.com/oauth2/token?
//grant_type=authorization_code
//&client_id=3qfmdgmqd367hvq4iuq1o80b3d
//&code_verifier=3502637000240000000026042760125828008680
//&redirect_uri=https://atl-ux.s3.eu-central-1.amazonaws.com/mermaid_ide/auth.html
//&code=0b590f90-e7f6-4333-a372-8e0465861625

//Convert Payload from Base64-URL to JSON
const decodePayload = payload => {
  const cleanedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
  const decodedPayload = atob(cleanedPayload)
  const uriEncodedPayload = Array.from(decodedPayload).reduce((acc, char) => {
    const uriEncodedChar = ('00' + char.charCodeAt(0).toString(16)).slice(-2)
    return `${acc}%${uriEncodedChar}`
  }, '')
  const jsonPayload = decodeURIComponent(uriEncodedPayload);
  alert(jsonPayload)
  return JSON.parse(jsonPayload)
}

//Parse JWT Payload
const parseJWTPayload = token => {
    const [header, payload, signature] = token.split('.');
    const jsonPayload = decodePayload(payload)
    return jsonPayload
};

//Parse JWT Header
const parseJWTHeader = token => {
    const [header, payload, signature] = token.split('.');
    const jsonHeader = decodePayload(header)

    return jsonHeader
};

//Generate a Random String
const getRandomString = () => {
    const randomItems = new Uint32Array(28);
    crypto.getRandomValues(randomItems);
    const binaryStringItems = randomItems.map(dec => `0${dec.toString(16).substr(-2)}`)
    return binaryStringItems.reduce((acc, item) => `${acc}${item}`, '');
}

//Encrypt a String with SHA256
const encryptStringWithSHA256 = async str => {
    const PROTOCOL = 'SHA-256'
    const textEncoder = new TextEncoder();
    const encodedData = textEncoder.encode(str);
    return crypto.subtle.digest(PROTOCOL, encodedData);
}

//Convert Hash to Base64-URL
const hashToBase64url = arrayBuffer => {
    const items = new Uint8Array(arrayBuffer)
    const stringifiedArrayHash = items.reduce((acc, i) => `${acc}${String.fromCharCode(i)}`, '')
    const decodedHash = btoa(stringifiedArrayHash)

    const base64URL = decodedHash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return base64URL
}

// Main Function
async function main() {
  var code = urlParams.get('code');
  var state = urlParams.get('state');
  console.log("main -> code", code);
  console.log("main -> state", state);
  //If code not present then request code else request tokens

  if (code == null){

    // Create PKCE code verifier
    var state = getRandomString();
    sessionStorage.setItem("pkce_state", state);
    console.log("pkce_state", state);
    var code_verifier = getRandomString();
    sessionStorage.setItem("code_verifier", code_verifier);
    console.log("code_verifier", code_verifier);
    // Create code challenge
    var arrayHash = await encryptStringWithSHA256(code_verifier);
    var code_challenge = hashToBase64url(arrayHash);
    sessionStorage.setItem("code_challenge", code_challenge);
    console.log("code_challenge", code_challenge);
    // Redirtect user-agent to /authorize endpoint
    location.href = "https://"+domain+".auth."+region+".amazoncognito.com/oauth2/authorize?response_type=code&state="+state+"&client_id="+appClientId+"&redirect_uri="+redirectURI+"&scope=openid&code_challenge_method=S256&code_challenge="+code_challenge;
    console.log(location.href);
  } else {

    // Verify state matches
    state = urlParams.get('state');
    console.log("Verify state matches -> code" , code)
    console.log("Verify state matches -> state:" , state)
    if(sessionStorage.getItem("pkce_state") != state) {
        alert("Invalid state");
    } else {

    // Fetch OAuth2 tokens from Cognito
    code_verifier = sessionStorage.getItem('code_verifier');
  await fetch("https://"+domain+".auth."+region+".amazoncognito.com/oauth2/token?grant_type=authorization_code&client_id="+appClientId+"&code_verifier="+code_verifier+"&redirect_uri="+redirectURI+"&code="+ code,{
  method: 'post',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }})
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    // Verify id_token
    tokens=data;
    var idVerified = verifyToken (tokens.id_token);
    Promise.resolve(idVerified).then(function(value) {
      if (value.localeCompare("verified")){
        alert("Invalid ID Token - "+ value);
        return;
      }
      });
    // Display tokens
    alert(tokens.id_token)
    document.getElementById("id_token").innerHTML = JSON.stringify(parseJWTPayload(tokens.id_token),null,'\t');
    document.getElementById("access_token").innerHTML = JSON.stringify(parseJWTPayload(tokens.access_token),null,'\t');
  });

    // Fetch from /user_info
    await fetch("https://"+domain+".auth."+region+".amazoncognito.com/oauth2/userInfo",{
      method: 'post',
      headers: {
        'authorization': 'Bearer ' + tokens.access_token,

    }})
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      // Display user information
      document.getElementById("userInfo").innerHTML = JSON.stringify(data, null,'\t');
    });
  }}}
  main();
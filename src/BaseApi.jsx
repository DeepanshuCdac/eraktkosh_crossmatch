const getSSOTicketVar = () => {
  console.log("Extracting SSO Ticket:");
  const urlParams = new URLSearchParams(window.location.hash.split("?")[1]);
  const varSSOTicketGrantingTicket = urlParams.get(
    "varSSOTicketGrantingTicket"
  );

  if (varSSOTicketGrantingTicket) {
    const currentTicket = sessionStorage.getItem("grantingTcn");

    if (currentTicket !== varSSOTicketGrantingTicket) {
      console.log(
        "Updating session storage with new SSO Ticket:",
        varSSOTicketGrantingTicket
      );
      sessionStorage.setItem("grantingTcn", varSSOTicketGrantingTicket);
    }
  } else {
    console.log("No SSO ticket found in the URL.");
  }
};

getSSOTicketVar();

const getUserAgent = () => {
  return navigator.userAgent;
};

const currentUrl = window.location.href;
console.log("Current URL:", currentUrl);

const urlObject = new URL(currentUrl);
const dynamicBaseURL = urlObject.port
  ? `${urlObject.protocol}//${urlObject.hostname}:${urlObject.port}`
  : `${urlObject.protocol}//${urlObject.hostname}`;

// export const baseURL = "http://10.226.30.41:8080";
// export const SSoToken =
//   "33.199.174.165.35.222.58.3.2.199.33.93.119.5.20.87.13.58.70.44.153.244.49.148.123.8.252.15.16.209.75.150.163.182.226.101.211.249.247.61.142.235.78.138.245.59.178.52";
// export const userAgent =
//   "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36";

export const baseURL = dynamicBaseURL+"/AiimsBloodBank";
export const SSoToken = sessionStorage.getItem("grantingTcn");
export const userAgent = getUserAgent();

console.log("Dynamic Base URL:", baseURL);
console.log("User Agent:", userAgent);
console.log("Token for Access:", SSoToken);

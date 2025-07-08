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

export const baseURL = "http://10.226.30.41:8080";
export const SSoToken =
  "128.137.219.61.146.239.58.140.37.56.209.23.11.28.38.77.113.217.87.166.206.243.172.213.98.36.99.37.54.175.146.67.67.123.13.60.183.245.170.206.225.219.67.97.128.245.56.210";
export const userAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36";

// export const baseURL = dynamicBaseURL+"/AiimsBloodBank";
// export const SSoToken = sessionStorage.getItem("grantingTcn");
// export const userAgent = getUserAgent();

console.log("Dynamic Base URL:", baseURL);
console.log("User Agent:", userAgent);
console.log("Token for Access:", SSoToken);

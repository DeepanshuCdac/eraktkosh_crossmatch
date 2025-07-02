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
  "0.93.216.37.83.176.182.59.127.96.12.247.85.206.137.167.142.72.83.109.17.246.143.242.116.129.14.128.146.232.20.226.227.91.230.172.56.107.25.122.152.97.115.88.219.144.89.246";
export const userAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36";

// export const baseURL = dynamicBaseURL+"/AiimsBloodBank";
// export const SSoToken = sessionStorage.getItem("grantingTcn");
// export const userAgent = getUserAgent();

console.log("Dynamic Base URL:", baseURL);
console.log("User Agent:", userAgent);
console.log("Token for Access:", SSoToken);

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

// export const baseURL = "http://10.10.10.96:8080/AiimsBloodBank";
export const baseURL = "http://10.226.30.41:8080";
export const SSoToken =
  "77.83.28.43.110.49.183.53.67.190.26.253.66.234.118.193.26.119.100.101.225.147.250.14.13.87.238.127.244.190.123.155.2.149.3.177.239.149.113.125.243.183.94.106.143.107.207.249";
export const userAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36";

// export const baseURL = dynamicBaseURL+"/AiimsBloodBank";
// export const SSoToken = sessionStorage.getItem("grantingTcn");
// export const userAgent = getUserAgent();

console.log("Dynamic Base URL:", baseURL);
console.log("User Agent:", userAgent);
console.log("Token for Access:", SSoToken);

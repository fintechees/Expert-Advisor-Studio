// This example is for the developers who want to sell EAs via Fintechee.io website.
// If you use EA for yourself or you don't care copyright infringement, then you don't need to add the codes below to your source files.

input string FINTECHEE_DATA = ""; // Keep this variable empty and DO NOT change the name of this variable.
input string FINTECHEE_SIGNATURE = ""; // Keep this variable empty and DO NOT change the name of this variable.
input string FINTECHEE_PUBLIC_KEY = ""; // Keep this variable empty and DO NOT change the name of this variable.
// string APPLICATION_PUBLIC_KEY = "-----BEGIN PUBLIC KEY-----MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwGzur7MO/CJPHvr2+r3lwxmjAL2d6nH2iyTwhL/CJZ8OGKm/+aikyluxoxF9Nq9aVLhCW5D1q9vAJCVYke7aquA/uuRE7a7frcWnKYOKNS2Pwvx88bJJBpfXfVh2K46i/2EfqdsghR+B1kSojS4lZggDB70uwIpeT2Q32X/5jEHl3p/9ZpFUwhStE2VMaEx/YOcdhAuS5BomDCe9g4KSI7faH3R0mA4dF1Tru6sAQarkAybI0RNlV52CpWfP2MfpeXm/P6WSXolM++DqFw8OsdrdqfyKM31zKyDOxzNib/DZbk72q6hzRtzGB4y3dTiyOVh3iP7nGOC/R0qPZCjRNQIDAQAB-----END PUBLIC KEY-----";
string APPLICATION_PUBLIC_KEY = ""; // Replace this string with your public key. The public key above is an example. DO NOT change the name of this variable. You can get your public key on Fintechee.io's inventory page. Please choose "Seller" to create an inventory item first, then a key pair will be generated.
bool bVerified = false; // This global variable is used to check whether your license is available. You can set an assert condition such as "if(!bVerified) return;" anywhere that you want to block abuse.

int OnInit (void) {
  // Please code the lines below anywhere that you want to verify the license. But note that calling VeriSig takes time, so we recommend you set an interval to check the license in the OnTick function or call VeriSig in OnInit.
  if (VeriSig(FINTECHEE_DATA, FINTECHEE_SIGNATURE, FINTECHEE_PUBLIC_KEY, APPLICATION_PUBLIC_KEY)) {
    bVerified = true;
    Print("Verification is done!");
  }
  return 0;
}

void OnTick(void) {
  if (!bVerified) return;
}

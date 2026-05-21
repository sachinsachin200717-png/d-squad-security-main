import { startAuthentication } from "@simplewebauthn/browser";

export default function BiometricLogin() {

  const handleBiometricLogin = async () => {
    try {

      // Demo authentication options
      const optionsJSON = {
        challenge: "1234567890",
        rpId: window.location.hostname,
        allowCredentials: [],
        userVerification: "preferred",
        timeout: 60000,
      };

      const authResp = await startAuthentication({ optionsJSON });

      console.log("Authentication Success:", authResp);

      alert("✅ Biometric Authentication Successful");

    } catch (error) {
      console.error(error);
      alert("❌ Authentication Failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-10">
      <button
        onClick={handleBiometricLogin}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl text-lg"
      >
        🔐 Login with Biometrics
      </button>
    </div>
  );
}
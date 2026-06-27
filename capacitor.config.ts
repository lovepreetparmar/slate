const config = {
  appId: "com.slate.app",
  appName: "Slate",
  webDir: ".next",
  ...(process.env.CAPACITOR_SERVER_URL
    ? {
        server: {
          url: process.env.CAPACITOR_SERVER_URL,
          androidScheme: "https" as const,
          cleartext: false,
        },
      }
    : {
        server: {
          androidScheme: "https" as const,
        },
      }),
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: "#ffffff",
      showSpinner: false,
    },
  },
};

export default config;

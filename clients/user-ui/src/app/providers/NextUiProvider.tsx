"use client";

import { graphQlClient } from "@/src/graphql/gql.setup";
import { ApolloProvider } from "@apollo/client";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";

function Providers({ children }: React.PropsWithChildren) {
  return (
    <ApolloProvider client={graphQlClient}>
      <NextUIProvider>
        <NextThemeProvider attribute="class" defaultTheme="dark">
          {children}
          <Toaster position="top-right" reverseOrder={false} />
        </NextThemeProvider>
        ;
      </NextUIProvider>
    </ApolloProvider>
  );
}

export default Providers;

"use client";
import { gql, DocumentNode } from "@apollo/client";

export const REGISTER_USER: DocumentNode = gql`
  mutation RegisterUser(
    $name: String!
    $password: String!
    $email: String!
    $address: String!
    $phone_number: Float!
  ) {
    register(
      registerDto: {
        name: $name
        email: $email
        password: $password
        address: $address
        phone_number: $phone_number
      }
    ) {
      activation_token
    }
  }
`;

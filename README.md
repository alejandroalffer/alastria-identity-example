# Example of how to use the Alastria Identity Library

## What it does

This is an example of how to interact with the libraries from [alastria-identity-lib](https://github.com/alastria/alastria-identity-lib). The library alastria-identity-lib recovers the Smart Contracts from [alastria-identity](https://github.com/alastria/alastria-identity).


**Important**: You need to clone again this repository or update `alastria-identity` **whenever a deploy of new smart contracts is made**. You easily update your repo with:
```sh
# Being in the alastria-identity-example directory
cd node_modules/alastria-identity-lib/alastria-identity
git pull
cd ..
node src/configFile.js
tsc
```

### Folders of example

|**Folder**|**What it does**|
|:--|:--|
|exampleCreateAlastriaID| Contains an example of how to create an Alastria ID
|exampleTokens| Contains an example of how to interact with [tokenFactory.ts](https://github.com/alastria/alastria-identity-lib/blob/develop/src/tokenFactory/tokensFactory.ts) functions|
|exampleCredentials| Contains examples of how to add and get Credentials in AlastriaID |
|examplePresentations| Contains examples of how to create, add and get Presentations in AlastriaID |
|exampleIdentityServiceProvider| Contains an example of how to add and remove a Identity Service Provider|
|exampleIdentityIssuer| Contains an example of how to add and remove a Identity Issuer|
|exampleFirstEntity| Contains an example of how to create the first identity with the admin account|
|exampleEntities| Contains an example of get list of entities and get entity information  |
|keystores| Contains the mocked keystores that we used to create the identities with different roles. These roles are explained [here](/keystores/README.md)  |



## How to use it

Then you can consume this library by running:

```sh
npm install
```
Now, you can use it from any JavaScript file in your working directory.

You can execute some of our examples by running:

```sh
cd example<FirstEntity, CreateAlastriaID, Credentials, Presentations, ...>
```

Then you can run the scripts in the correct order marked in each of the scripts

```sh
node x.<script>
```

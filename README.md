# Serverless Termination Protection Plugin

Created by Ryan Jones from [Serverless Guru](https://serverlessguru.com). Copyright Serverless Guru, LLC 2019. Released under the MIT license.

## Overview and purpose
This plugin allows you to add AWS Cloudformation termination protection to your Serverless Framework stacks (serverless.yml).

Currently, the only way to enable termination protection is manually through the AWS Console or through the AWS CLI. This solution will allow you to skip doing either of those things.

This plugin fits directly into your existing Serverless Framework projects and it can also take arguments! The current arguments are `profile` and `stages`. Let's discuss these in more detail, below.

## Installation

To install with npm, run this in your service directory:

```
npm install --save-dev serverless-termination-protection
```

To install with yarn, run this in your service directory:

```
yarn add serverless-termination-protection
```

Then add this to your `serverless.yml`:

```
plugins:
 - serverless-termination-protection
```

## Configuartion

The default is to add termination protection to every deployment when you install the plugin.

For more complex use cases, add an `serverlessTerminationProtection` section like this in your `serverless.yml`:

```
custom:
  serverlessTerminationProtection:
    stages:
      - prod
      - dev
```

The `stages` property represents the specific stages you want the termination protection to apply too. Let's look at some examples.

## Examples

First off, let's assume you want all deployments to have termination protection the `terminal command` will look like this:

```
sls deploy -v
```

And your `serverless.yml` will only need this:

```
plugins:
  - serverless-termination-protection
```

For more complex use cases, let's assume we want to only apply termination protection to specific stages. The `terminal command` will look like this:

```
sls deploy --stage prod -v
```

And your `serverless.yml` will only need this:

```
service: ...

provider:
  name: aws
  profile: ${opt:profile, "default"}
  region: ${opt:region, "us-west-2"}
  stage: ${opt:stage, "dev"}

plugins:
  - serverless-termination-protection

custom:
  serverlessTerminationProtection:
    stages:
      - prod
      - alpha

functions:
  ...
```

As you can see we have the `stages` option as an array of string values. Where `prod` and `alpha` are the stages to add termination protection too.

Let's imagine we deployed to `dev` with this terminal command:

```
sls deploy --stage dev -v
```

The plugin will compare the stage you passed `dev` with the `stages` you listed under `serverlessTerminationProtection` in your `serverless.yml`.

The hook that is being used for the `serverless-termination-plugin` is `after:deploy:finalize`. Which means that after the Serverless Framework finishes deploying your service the `serverless-termination-plugin` will then add termination protection to your stack if it meets the conditions you specified.
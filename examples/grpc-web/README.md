# mozolm-web Sample
This directory contains a working example of a web based gRPC client
requesting data from a gRPC service, mozolm.

The mozolm service is launched via a docker container or
a executable on the command line,
listing for requests on port `:9090`. The service is defined by
protocol buffers in `lm_scores.proto` and `service.proto` as found in
the mozolm codebase. These files are used to generate js_pb stubs and
these are packed and delivered via npm.

A proxy service, Envoy, is run via `docker` and defined in `envoy.yaml`
Here we configure Envoy to listen at port `:8080`,
and forward any gRPC-Web requests to a cluster at port `:9090`.

The web client is written in `client_mozolm.js` and is packaged with
`webpack` and loaded through `index.html`.

This example is based off the sample code found in the gRPC-web
[repo](https://github.com/grpc/grpc-web).

For more information on gRPC-web and this architecture, refer
to [State of gRPC-web](https://grpc.io/blog/state-of-grpc-web/)

## TL;DR
./config.sh

## Pre-Requisits
[Docker](https://www.docker.com).

## Compile the Client JavaScript Code

Compile the client side JavaScript code into something that
can be consumed by the browser.

```sh
$ npm install
```

Here we use `webpack` with `webpack.config.js` defining the config. You can also
use `browserify` or other similar tools. This will resolve all the `require()`
statements and produce a `./dist/main.js` file that can be embedded in our
`index.html` file.

## Run the Example

We are ready to run the Hello World example. The following set of commands will
run the 3 processes all in the background.

 1. Run the mozoLM gRPC Service. This listens at port `:9090`. The service
 expects a physical file ~/training.txt.

 ```sh
 $ docker run -d --init -v ~/:/data -p 9090:9090 gcr.io/mozolm-release/server_async \
    --server_config="address_uri:\"0.0.0.0:9090\" model_hub_config { model_config { \
      type:PPM_AS_FST storage { model_file:\"/data/training.txt\" ppm_options { \
      max_order: 4 static_model: false } } } }"
 ```

 2. Run the Envoy proxy. The `envoy.yaml` file configures Envoy to listen to
 browser requests at port `:8080`, and forward them to port `:9090` (see
 above).

 ```sh
 $ docker run -d -v "$(pwd)"/envoy.yaml:/etc/envoy/envoy.yaml:ro \
     --network=host envoyproxy/envoy:v1.17.0
 ```

 3. Run the simple Web Server. This hosts the static file `index.html` and
 `dist/main.js` we generated earlier.

 ```sh
 $ npm start
 ```

When these are all ready, you can open a browser tab and navigate to

```
localhost:8081
```

Type in the text box, and you should see ranked probabilities
for the 7-best characters predicted.

```
Input: Ask a Q

[u,0.9922211799912886]
[ ,0.001395981110616612]
[i,0.0013239304546566095]
[.,0.00037455736154796135]
[v,0.00028343449862435355]
[ ,0.0002707196779754611]
[a,0.00012079077178985971]
```

#Build mozoLM
echo '** Building MozoLM **'
pushd .
cd ../../
bazel build -c opt --host_copt=-DGRPC_BAZEL_BUILD //...
popd

#Copy Files
echo '** Copying Artifacts **'
cp ../../bazel-bin/mozolm/grpc/service_js_grpc_proto_web_pb/mozolm/grpc/service_pb.js ./
cp ../../bazel-bin/mozolm/grpc/service_js_grpc_proto_web_pb/mozolm/grpc/service_grpc_web_pb.js ./
cp ../../bazel-bin/mozolm/models/lm_scores_jspb_proto_pb/mozolm/models/lm_scores_pb.js ./

#Edit Files
echo '** Updateing Artifacts **'
sed -i "" 's+../../mozolm/models+.+' service_pb.js
sed -i "" 's+../../mozolm/models+.+' service_grpc_web_pb.js

#Compile/Webpack
echo '** Installing  **'
npm install
npx webpack client_mozolm.js

#Launch docker/Envoy
echo '** Launching Envoy Proxy  **'
docker run -d -v "$(pwd)"/envoy.yaml:/etc/envoy/envoy.yaml:ro -p 8080:8080 -p 9901:9901 envoyproxy/envoy:v1.17.0

#Launch Web App
echo '** Launching gRPC-web Demo  **'
python3 -m http.server 8083 &

#Launch MozoLM
echo '** Launching MozoLM Service  **'
export DATADIR=../../mozolm/models/testdata
export TEXTFILE="${DATADIR}"/en_wiki_1Kline_sample.txt
../../bazel-bin/mozolm/grpc/server_async \
     --server_config="address_uri:\"localhost:9090\" \
     model_hub_config { model_config { type:PPM_AS_FST storage { \
     model_file:\"$TEXTFILE\" ppm_options { max_order: 4 \
     static_model: false } } } }" && fg

wait

#!/bin/bash

if [ $# -lt 1 ]
then
    RENDERER="./config/kustomize/base/helm-renderer"
else
    RENDERER="./config/kustomize/overlays/$1/helm-renderer"
    if [ ! -f $RENDERER ]
    then
        echo "There is no overlay for [$1]" >&2
        exit 1
    fi
fi

NAMESPACE="astroshop"

helm upgrade --install astroshop ./charts/astroshop \
    --create-namespace \
    --namespace "${NAMESPACE}" \
    --atomic \
    -f "./config/helm-values/values.yaml" \
    --post-renderer "$RENDERER"

# --- For testing ---
# helm template astroshop ./charts/astroshop \
#     --create-namespace \
#     --namespace "${NAMESPACE}" \
#     --atomic \
#     -f "./config/helm-values/test.yaml" \
#     --post-renderer "$RENDERER"

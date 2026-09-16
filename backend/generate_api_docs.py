import json
import os

with open("openapi.json", "r") as f:
    spec = json.load(f)

md = ["# FINBRIDGE API Documentation\n"]
md.append("This document outlines the core APIs for the FINBRIDGE alternative credit scoring and micro-lending platform.\n")

paths = spec.get("paths", {})
for endpoint, methods in paths.items():
    for method, details in methods.items():
        md.append(f"## {details.get('summary', endpoint)}")
        md.append(f"**Method**: `{method.upper()}`")
        md.append(f"**Endpoint**: `{endpoint}`")
        
        # Auth
        security = details.get("security", [])
        if security:
            md.append("**Authentication**: Required (Firebase JWT Bearer Token)")
        else:
            md.append("**Authentication**: None")
            
        # Request
        md.append("\n**Request**:")
        req_body = details.get("requestBody")
        if req_body:
            content = req_body.get("content", {})
            if "application/json" in content:
                schema = content["application/json"].get("schema", {})
                if "$ref" in schema:
                    ref = schema["$ref"].split("/")[-1]
                    md.append(f"JSON Body Schema: `{ref}`")
            elif "multipart/form-data" in content:
                md.append("Form Data (File Upload)")
        else:
            md.append("None or Path/Query Parameters")
            
        # Responses
        md.append("\n**Responses**:")
        responses = details.get("responses", {})
        for status, res in responses.items():
            desc = res.get("description", "")
            md.append(f"- `{status}`: {desc}")
            
        md.append("\n---\n")

os.makedirs("../docs", exist_ok=True)
with open("../docs/api.md", "w") as f:
    f.write("\n".join(md))

print("Created api.md")

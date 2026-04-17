#!/usr/bin/env python3
"""Use Aliyun ECS RunCommand API to execute commands on the server directly"""
import json, time, subprocess
from urllib.request import urlopen, Request
from urllib.parse import urlencode
import hmac, hashlib, base64

# Load credentials
with open('/workspace/aliyun_cred.json') as f:
    cred = json.load(f)

AKID = cred['AccessKeyId']
AKSEC = cred['AccessKeySecret']
REGION = 'cn-hangzhou'
INSTANCE_ID = 'dd3d15270c374b5186433a55921dec9f'

def sign(method, path, params, secret):
    """Aliyun API signature v1"""
    sorted_params = sorted(params.items())
    str_to_sign = method + '\n' + path + '\n' + urlencode(sorted_params)
    return base64.b64encode(
        hmac.new(secret.encode(), str_to_sign.encode(), hashlib.sha1).digest()
    ).decode()

def api_call(action, params):
    path = '/'
    common = {
        'Format': 'JSON', 'Version': '2014-05-26',
        'AccessKeyId': AKID, 'SignatureMethod': 'HMAC-SHA1',
        'SignatureVersion': '1.0', 'SignatureNonce': str(time.time()),
        'Timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'RegionId': REGION
    }
    all_params = {**common, 'Action': action, **params}
    sig = sign('GET', path, all_params, AKSEC)
    all_params['Signature'] = sig
    url = f'https://ecs.{REGION}.aliyuncs.com/?{urlencode(all_params)}'
    try:
        r = urlopen(url, timeout=15)
        return json.loads(r.read())
    except Exception as e:
        return {'error': str(e)}

# Try RunCommand - execute shell command on the ECS instance
print("=== Trying Aliyun RunCommand API ===")

# First check if the instance supports RunCommand
print("Instance ID:", INSTANCE_ID)
print("Region:", REGION)

# Try to describe the instance first
r = api_call('DescribeInstances', {'InstanceIds': f'["{INSTANCE_ID}"]'})
print("DescribeInstances:", json.dumps(r.get('Instances', {}).get('Instance', [{}])[0], indent=2) if 'Instances' in r else r.get('error', 'no instances'))

# Try RunCommand
cmd_params = {
    'InstanceId': INSTANCE_ID,
    'CommandContent': 'aGVsbG8gd29ybGQ=',  # base64: "hello world"
    'Type': 'RunShellScript',
    'Timeout': 60
}
r = api_call('RunCommand', cmd_params)
print("RunCommand result:", json.dumps(r, indent=2))

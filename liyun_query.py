import json, hashlib, hmac, base64, urllib.parse, time, uuid, urllib.request

with open('/workspace/aliyun_cred.json', 'r') as f:
    cred = json.load(f)

access_key_id = cred['AccessKey_ID']
access_key_secret = cred['AccessKey_Secret']
instance_id = 'dd3d15270c374b5186433a55921dec9f'
region_id = 'cn-hangzhou'

def sign(params, secret):
    sorted_params = sorted(params.items())
    string_to_sign = 'GET&%2F&' + urllib.parse.quote_plus('&'.join(f'{k}={v}' for k,v in sorted_params))
    return base64.b64encode(hmac.new((secret + '&').encode(), string_to_sign.encode(), hashlib.sha1).digest()).decode()

params = {
    'Format': 'JSON',
    'Version': '2014-05-26',
    'AccessKeyId': access_key_id,
    'SignatureMethod': 'HMAC-SHA1',
    'Timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
    'SignatureVersion': '1.0',
    'SignatureNonce': str(uuid.uuid4()),
    'RegionId': region_id,
    'Action': 'DescribeInstances',
    'InstanceIds': json.dumps([instance_id]),
}
params['Signature'] = sign(params, access_key_secret)

url = 'https://ecs.aliyuncs.com/?' + '&'.join(f"{urllib.parse.quote(str(k))}={urllib.parse.quote(str(v))}" for k,v in params.items())
with urllib.request.urlopen(url, timeout=10) as r:
    data = json.loads(r.read())

instances = data.get('Instances', {}).get('Instance', [])
if instances:
    inst = instances[0]
    print(f"IP: {inst.get('PublicIpAddress', {}).get('IpAddress', ['N/A'])[0]}")
    print(f"Status: {inst.get('InstanceStatus')}")
    print(f"OS: {inst.get('OSName')}")
    print(f"Zone: {inst.get('ZoneId')}")
else:
    print(json.dumps(data, indent=2, ensure_ascii=False))

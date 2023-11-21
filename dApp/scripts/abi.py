import json
dex_contract_address = "0xECdc562F32F2095cA8d6d72c40FECd28eEBAA9FE"
dex_json_path = "./build/deployments/11155111/" + dex_contract_address + ".json"
token_contract_address = "0xBB6F07A931F53da1f4e4C82DD9dac2EA13c77Bf8"
token_json_path = "./build/deployments/11155111/" + token_contract_address + ".json"

def get_abi(json_path):
    with open(json_path, "r") as f:
        data = json.loads(f.read())
    return data['abi']


def main():
    print("\n\nDex: contract=%s, abi = %s" % (dex_contract_address, json.dumps(get_abi(dex_json_path))))
    print("\n\nToken: contract=%s, abi = %s" % (token_contract_address, json.dumps(get_abi(token_json_path))))


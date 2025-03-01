# Moosh Project at EthDenver

Short pitch: Privacy preserving matching app for socialites using SGX to facilitate the matching algorithm, keeping profiles confidential.

Stretch goal: Extend functionality to make use of ICP, especially the new features in challenge 2. C1 and C2 are targets.

MooshMatch / Wingman

## Infra setup steps

Chose Vultr Bare Metal E-2286G for an SGX-compatible server to run the confidential matching engine backend.

1. Apt installation of sgx from https://github.com/edgelesssys/ego

```
sudo mkdir -p /etc/apt/keyrings
wget -qO- https://download.01.org/intel-sgx/sgx_repo/ubuntu/intel-sgx-deb.key | sudo tee /etc/apt/keyrings/intel-sgx-keyring.asc > /dev/null
echo "deb [signed-by=/etc/apt/keyrings/intel-sgx-keyring.asc arch=amd64] https://download.01.org/intel-sgx/sgx_repo/ubuntu $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/intel-sgx.list
sudo apt update
EGO_DEB=ego_1.7.0_amd64_ubuntu-$(lsb_release -rs).deb
wget https://github.com/edgelesssys/ego/releases/download/v1.7.0/$EGO_DEB
sudo apt install ./$EGO_DEB build-essential libssl-dev
```

May need to redo `apt install ./ego\*.deb

2. Verify existence of `cat /etc/sgx_default_qcnl.conf`

3. Set CA strictness to false `nano /etc/sgx_default_qcnl.conf`

4. Install quote provider for SGX

```
sudo mkdir -p /etc/apt/keyrings
wget -qO- https://download.01.org/intel-sgx/sgx_repo/ubuntu/intel-sgx-deb.key | sudo tee /etc/apt/keyrings/intel-sgx-keyring.asc > /dev/null
echo "deb [signed-by=/etc/apt/keyrings/intel-sgx-keyring.asc arch=amd64] https://download.01.org/intel-sgx/sgx_repo/ubuntu $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/intel-sgx.list
sudo apt update
sudo apt install libsgx-dcap-default-qpl
```

5. Install docker
6. Use docker to set up the pccs

`docker run -e APIKEY=<your-API-key> -p 8081:8081 --name pccs -d ghcr.io/edgelesssys/pccs`

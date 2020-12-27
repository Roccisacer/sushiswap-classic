import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
})

const GAS_LIMIT = {
  STAKING: {
    DEFAULT: 200000,
    SNX: 850000,
  },
}

export const getMasterChefAddress = (UBQT) => {
  return UBQT && UBQT.masterChefAddress
}
export const getUBQTAddress = (UBQT) => {
  return UBQT && UBQT.ubqtAddress
}
export const getWethContract = (UBQT) => {
  return UBQT && UBQT.contracts && UBQT.contracts.weth
}

export const getMasterChefContract = (UBQT) => {
  return UBQT && UBQT.contracts && UBQT.contracts.masterChef
}
export const getUBQTContract = (UBQT) => {
  return UBQT && UBQT.contracts && UBQT.contracts.sushi
}

export const getXUBQTStakingContract = (UBQT) => {
  return UBQT && UBQT.contracts && UBQT.contracts.xSushiStaking
}

export const getFarms = (UBQT) => {
  return UBQT
    ? UBQT.contracts.pools.map(
        ({
          pid,
          name,
          symbol,
          icon,
          tokenAddress,
          tokenSymbol,
          tokenContract,
          lpAddress,
          lpContract,
        }) => ({
          pid,
          id: symbol,
          name,
          lpToken: symbol,
          lpTokenAddress: lpAddress,
          lpContract,
          tokenAddress,
          tokenSymbol,
          tokenContract,
          earnToken: 'ubqt',
          earnTokenAddress: ubqt.contracts.ubqt.options.address,
          icon,
        }),
      )
    : []
}

export const getPoolWeight = async (MasterDistributorContract, pid) => {
  const { allocPoint } = await MasterDistributorContract.methods.poolInfo(pid).call()
  const totalAllocPoint = await MasterDistributorContract.methods
    .totalAllocPoint()
    .call()
  return new BigNumber(allocPoint).div(new BigNumber(totalAllocPoint))
}

export const getEarned = async (MasterDistributorContract, pid, account) => {
  return MasterDistributorContract.methods.pendingUBQT(pid, account).call()
}

export const getTotalLPWethValue = async (
  MasterDistributorContract,
  wethContract,
  lpContract,
  tokenContract,
  pid,
) => {
  // Get balance of the token address
  const tokenAmountWholeLP = await tokenContract.methods
    .balanceOf(lpContract.options.address)
    .call()
  const tokenDecimals = await tokenContract.methods.decimals().call()
  // Get the share of lpContract that masterChefContract owns
  const balance = await lpContract.methods
    .balanceOf(MasterDistributorContract.options.address)
    .call()
  // Convert that into the portion of total lpContract = p1
  const totalSupply = await lpContract.methods.totalSupply().call()
  // Get total weth value for the lpContract = w1
  const lpContractWeth = await wethContract.methods
    .balanceOf(lpContract.options.address)
    .call()
  // Return p1 * w1 * 2
  const portionLp = new BigNumber(balance).div(new BigNumber(totalSupply))
  const lpWethWorth = new BigNumber(lpContractWeth)
  const totalLpWethValue = portionLp.times(lpWethWorth).times(new BigNumber(2))
  // Calculate
  const tokenAmount = new BigNumber(tokenAmountWholeLP)
    .times(portionLp)
    .div(new BigNumber(10).pow(tokenDecimals))

  const wethAmount = new BigNumber(lpContractWeth)
    .times(portionLp)
    .div(new BigNumber(10).pow(18))
  return {
    tokenAmount,
    wethAmount,
    totalWethValue: totalLpWethValue.div(new BigNumber(10).pow(18)),
    tokenPriceInWeth: wethAmount.div(tokenAmount),
    poolWeight: await getPoolWeight(masterChefContract, pid),
  }
}

export const approve = async (lpContract, MasterDistributorContract, account) => {
  return lpContract.methods
    .approve(MasterDistributorContract.options.address, ethers.constants.MaxUint256)
    .send({ from: account })
}

export const approveAddress = async (lpContract, address, account) => {
  return lpContract.methods
      .approve(address, ethers.constants.MaxUint256)
      .send({ from: account })
}

export const getUBQTSupply = async (UBQT) => {
  return new BigNumber(await UBQT.contracts.ubqt.methods.totalSupply().call())
}

export const getXUBQTSupply = async (UBQT) => {
  return new BigNumber(await UBQT.contracts.xUBQTStaking.methods.totalSupply().call())
}

export const stake = async (MasterDistributorContract, pid, amount, account) => {
  return MasterDistributorContract.methods
    .deposit(
      pid,
      new BigNumber(amount).times(new BigNumber(10).pow(18)).toString(),
    )
    .send({ from: account })
    .on('transactionHash', (tx) => {
      console.log(tx)
      return tx.transactionHash
    })
}

export const unstake = async (MasterDistributorContract, pid, amount, account) => {
  return MasterDistributoContract.methods
    .withdraw(
      pid,
      new BigNumber(amount).times(new BigNumber(10).pow(18)).toString(),
    )
    .send({ from: account })
    .on('transactionHash', (tx) => {
      console.log(tx)
      return tx.transactionHash
    })
}
export const harvest = async (MasterDistributorContract, pid, account) => {
  return MasterDistributorContract.methods
    .deposit(pid, '0')
    .send({ from: account })
    .on('transactionHash', (tx) => {
      console.log(tx)
      return tx.transactionHash
    })
}

export const getStaked = async (MasterDistributorContract, pid, account) => {
  try {
    const { amount } = await MasterDistributorContract.methods
      .userInfo(pid, account)
      .call()
    return new BigNumber(amount)
  } catch {
    return new BigNumber(0)
  }
}

export const redeem = async (MasterDistributorContract, account) => {
  let now = new Date().getTime() / 1000
  if (now >= 1597172400) {
    return MasterDistributorContract.methods
      .exit()
      .send({ from: account })
      .on('transactionHash', (tx) => {
        console.log(tx)
        return tx.transactionHash
      })
  } else {
    alert('pool not active')
  }
}

export const enter = async (contract, amount, account) => {
  debugger
  return contract.methods
      .enter(
          new BigNumber(amount).times(new BigNumber(10).pow(18)).toString(),
      )
      .send({ from: account })
      .on('transactionHash', (tx) => {
        console.log(tx)
        return tx.transactionHash
      })
}

export const leave = async (contract, amount, account) => {
  return contract.methods
      .leave(
          new BigNumber(amount).times(new BigNumber(10).pow(18)).toString(),
      )
      .send({ from: account })
      .on('transactionHash', (tx) => {
        console.log(tx)
        return tx.transactionHash
      })
}

const axios = require('axios')
require('dotenv').config()

const { PAYSTACK_API_URL, PAYSTACK_SECRET_KEY } = process.env

exports.createPaystackCustomer = async (email, firstName='', lastName='', phoneNumber='') => {
  const data = await axios.post(
    `${PAYSTACK_API_URL}/customer`, 
    {email, firstName, lastName, phoneNumber},
    {
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
        "cache-control": "no-cache",
      }
    }
  )
  const res = await data.data
  return res
}

exports.checkPaystackCustomer = async (customer) => {
  const data = await axios.get(
    `${PAYSTACK_API_URL}/customer/${customer}`,
    {
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json"      }
    }
  )
  const res = await data.data
  return res
}


exports.initializeTransaction = async (amount, email, currency='NGN') => {
  const data = await axios.post(
    `${PAYSTACK_API_URL}/transaction/initialize`,
    {
      amount, email, currency
    },
    {
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json"
      }
    }
  )
  const res = await data.data
  return res
}


exports.verifyTransaction = async (reference) => {
  const data = await axios.get(
    `${PAYSTACK_API_URL}/transaction/verify/${reference}`,
    {
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json"
      }
    }
  )
  const res = await data.data
  return res
}


exports.createTransferRecipient = async (accountNumber, bankCode, bankName, currency='NGN', name, email, type='nuban') => {
const data = await axios.post(
    `${PAYSTACK_API_URL}/transferrecipient`,
    {accountNumber, bankCode, bankName, currency, type, name, email},
    {
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      }
    }
  )
  const res = await data.data
  return res
}


exports.initiateTransfer = async (amount, bank_recipient_code, reason='Withdraw', source='balance') => {
  console.log({ amount, recipient: bank_recipient_code, reason, source })
  try {
    const data = await axios.post(
      `${PAYSTACK_API_URL}/transfer`,
      { amount, recipient: bank_recipient_code, reason, source },
      {
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json"
        }
      }
    )
    const res = await data.data
    return res
  } catch (error) {
    console.log(error.message)
  }
}


exports.finalizeTransfer = async (transfer_code, otp) => {
  const data = await axios.post(
    `${PAYSTACK_API_URL}/transfer/finalize_transfer`,
    { transfer_code, otp },
    {
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json"
      }
    }
  )
  const res = await data.data
  return res
}

exports.withdraw = async (amount, bank_recipient_code, reason='Withdraw', source='balance') => {
  try {
    const initiatedTransfer = await this.initiateTransfer(amount, bank_recipient_code, reason, source)
    console.log(initiatedTransfer);
    if (initiatedTransfer.status === 'success') {
      const transfer = await this.finalizeTransfer(initiatedTransfer.data.transfer_code)
      return transfer
    }
  } catch (error) {
    console.log(error.message)
  }
}


exports.resolveBank = async (accountNumber, bankCode) => {
  try {
    const data = await axios.get(
    `${PAYSTACK_API_URL}/bank/resolve?bank_code=${bankCode}&account_number=${accountNumber}`,
    {
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json"
      }
    }
  )
  const res = await data.data
  return res
  } catch (error) {
    console.log(error.message)
  }
}

exports.addBank = async (
  account_number, bank_code, name, description="My Bank Details", type='nuban', currency='NGN'
) => {
  const data = await axios.post(
    `${PAYSTACK_API_URL}/transferrecipient`,
    {
      account_number, bank_code, currency, type, name, description
    },
    {
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json"
      }
    }
  )
  const res = await data.data
  return res
}

exports.deleteBank = async (recipient_code) => {
  const data = await axios.delete(
    `${PAYSTACK_API_URL}/transferrecipient/${recipient_code}`,
    {
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json"
      }
    }
  )
  const res = await data.data
  return res
}
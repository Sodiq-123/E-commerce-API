const model = require('../models')

export const CreditAccount = async (
  amount,
  accountId,
  reference,
  t,
  res,
  meta,
  purpose
) => {
  try {
    const account = await model.account.findOne({
      where: {
        id: accountId
      },
      transaction: t
    })
    if (!account) {
      return res.status(400).json({
        success: false,
        message: 'Account not found'
      })
    }

    await model.account.increment(
      { balance: amount },
      { where: {
        id: accountId
      },
      transaction: t }
    )

    await model.transactions.create(
      {
        transactionType: 'credit',
        amount,
        accountId: accountId,
        reference,
        purpose,
        meta,
        balanceBefore: Number(account.balance),
        balanceAfter: Number(account.balance) + Number(amount)
      }, {
        transaction: t,
        lock: t.LOCK.UPDATE
      }
    ) 
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    })
  }
}

export const DebitAccount = async ({
  amount,
  accountId,
  reference,
  t,
  res,
  meta,
  purpose
}) => {
  try {
    const account = await model.account.findOne({
      where: {
        id: accountId
      },
      transaction: t
    })
    if (!account) {
      return res.status(400).json({
        success: false,
        message: 'Account not found'
      })
    }

    if (Number(account.balance) < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient funds'
      })
    }

    await model.account.increment(
      { balance: -amount },
      { where: {
        id: accountId
      },
      transaction: t }
    )

    await model.transactions.create(
      {
        transactionType: 'debit',
        amount,
        accountId: accountId,
        reference,
        purpose,
        meta,
        balanceBefore: Number(account.balance),
        balanceAfter: Number(account.balance) - Number(amount)
      },
      { transaction: t, lock: t.LOCK.UPDATE }
    )
  } catch (error) {
    await t.rollback()
    return res.status(400).json({
      success: false,
      message: error.message
    })
  }
}
const model = require('../models')

export const CreditAccount = async (
  amount,
  accountId,
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
        accountId,
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
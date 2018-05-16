var arr = [
{
	"_id" : ObjectId("59f96f4508bbe9001261d992"),
	"userId" : "59f94598ab20970017bcba85",
	"amount" : 500,
	"totalAmount" : 500,
	"product" : {
		"_id" : ObjectId("56ce758be7926c7f94e1dc72"),
		"updatedAt" : ISODate("2017-09-14T06:58:10.906+08:00"),
		"createdAt" : ISODate("2017-09-14T06:58:10.906+08:00"),
		"term" : 7,
		"minAmount" : 500,
		"maxAmount" : 500,
		"rate" : 0.0006,
		"feeRate" : 0.062,
		"__v" : 0,
		"id" : "56ce758be7926c7f94e1dc72",
		"overdue" : {
			"principalGap" : 1000,
			"lessPrincipalFeeRate" : 0.01,
			"termGap" : 15,
			"lessTermFeeRate" : 0.005,
			"largeTermFeeRate" : 0.0075,
			"dayFee" : 10
		}
	},
	"createTime" : ISODate("2017-11-01T14:52:53.351+08:00"),
	"lendBankcard" : {
		"bankName" : "中国建设银行",
		"bankcode" : "CCB",
		"phone" : "13549584406",
		"bankcardNo" : "6217002980106345437",
		"_id" : ObjectId("59f945b8f88a9a001b207ce4")
	},
	"userOrderId" : "171101145253351",
	"status" : "auditing",
	"id" : "59f96f4508bbe9001261d992",
	"createdAt" : ISODate("2017-11-01T14:52:53.374+08:00"),
	"updatedAt" : ISODate("2017-11-01T14:52:53.912+08:00"),
	"machineAudit" : {
		"warningPoint" : [
			{
				"value" : "灰名单C02-严审",
				"key" : "身份证号码",
				"_id" : ObjectId("59f96f4508bbe9001261d9aa")
			}
		],
		"selfLevel" : "B",
		"selfScore" : 423.88,
		"modelLevel" : "B",
		"modelScore" : 328.71156677285586,
		"quota" : 500,
		"status" : 1
	}
},

{
	"_id" : ObjectId("59f9470cab20970017bcbac5"),
	"userId" : "59f94598ab20970017bcba85",
	"amount" : 500,
	"totalAmount" : 500,
	"product" : {
		"_id" : ObjectId("56ce758be7926c7f94e1dc72"),
		"updatedAt" : ISODate("2017-09-14T06:58:10.906+08:00"),
		"createdAt" : ISODate("2017-09-14T06:58:10.906+08:00"),
		"term" : 7,
		"minAmount" : 500,
		"maxAmount" : 500,
		"rate" : 0.0006,
		"feeRate" : 0.062,
		"__v" : 0,
		"id" : "56ce758be7926c7f94e1dc72",
		"overdue" : {
			"principalGap" : 1000,
			"lessPrincipalFeeRate" : 0.01,
			"termGap" : 15,
			"lessTermFeeRate" : 0.005,
			"largeTermFeeRate" : 0.0075,
			"dayFee" : 10
		}
	},
	"createTime" : ISODate("2017-11-01T12:01:16.096+08:00"),
	"lendBankcard" : {
		"bankName" : "中国建设银行",
		"bankcode" : "CCB",
		"phone" : "13549584406",
		"bankcardNo" : "6217002980106345437",
		"_id" : ObjectId("59f945b8f88a9a001b207ce4")
	},
	"userOrderId" : "171101120116096",
	"repaymentPlan" : [
		{
			"fee" : 31,
			"interest" : 2.1,
			"principal" : 500,
			"amount" : 533.1,
			"periods" : 7,
			"endDate" : ISODate("2017-11-08T00:00:00.000+08:00"),
			"startDate" : ISODate("2017-11-01T00:00:00.000+08:00"),
			"_id" : ObjectId("59f97fea82edf000128fe585")
		}
	],
	"status" : "repaying",
	"id" : "59f9470cab20970017bcbac5",
	"createdAt" : ISODate("2017-11-01T12:01:16.175+08:00"),
	"updatedAt" : ISODate("2017-11-01T16:03:54.044+08:00"),
	"machineAudit" : {
		"warningPoint" : [
			{
				"value" : "灰名单C02-严审",
				"key" : "身份证号码",
				"_id" : ObjectId("59f97b22f9d20d001611a4a7")
			}
		],
		"selfLevel" : "B",
		"selfScore" : 423.88,
		"modelLevel" : "B",
		"modelScore" : 345.0523371136376,
		"quota" : 500,
		"status" : 1
	},
	"auditTime" : ISODate("2017-11-01T14:49:06.754+08:00"),
	"lendTime" : ISODate("2017-11-01T16:03:54.034+08:00")
}
]
db.loans.insert(arr);

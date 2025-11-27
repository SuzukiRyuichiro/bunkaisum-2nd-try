DROP VIEW `balanceView`;--> statement-breakpoint
CREATE VIEW `balanceView` AS select "involvements"."userId", "users"."displayName", "users"."profilePictureUrl", SUM("involvements"."amount") as "net_balance", 
      CASE
        WHEN SUM("involvements"."amount") > 0 THEN 'Creditor'
        WHEN SUM("involvements"."amount") < 0 THEN 'Debtor'
        ELSE 'Neutral'
      END
     as "status" from "involvements" inner join "users" on "involvements"."userId" = "users"."id" group by "involvements"."userId", "users"."displayName" order by SUM("involvements"."amount") desc;
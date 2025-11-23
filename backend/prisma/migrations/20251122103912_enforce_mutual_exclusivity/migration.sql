-- CreateTable
CREATE TABLE "User" (
    "address" TEXT NOT NULL,
    "email" TEXT,
    "isWorldIdVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "tokenId" INTEGER NOT NULL,
    "ownerAddress" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'IDLE',
    "pnr" TEXT,
    "departureTime" INTEGER NOT NULL,
    "route" TEXT NOT NULL,
    "price" TEXT NOT NULL DEFAULT '0',
    "lastPriceUpdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("tokenId")
);

-- CreateTable
CREATE TABLE "Loan" (
    "id" TEXT NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "userAddress" TEXT NOT NULL,
    "debt" TEXT NOT NULL,
    "healthFactor" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Loan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stake" (
    "id" TEXT NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "userAddress" TEXT NOT NULL,
    "stakedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Stake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "sellerAddress" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "listedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceUpdate" (
    "id" TEXT NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "price" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Ticket_ownerAddress_idx" ON "Ticket"("ownerAddress");

-- CreateIndex
CREATE INDEX "Ticket_status_idx" ON "Ticket"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Loan_ticketId_key" ON "Loan"("ticketId");

-- CreateIndex
CREATE UNIQUE INDEX "Stake_ticketId_key" ON "Stake"("ticketId");

-- CreateIndex
CREATE UNIQUE INDEX "Listing_ticketId_key" ON "Listing"("ticketId");

-- CreateIndex
CREATE INDEX "PriceUpdate_ticketId_idx" ON "PriceUpdate"("ticketId");

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_ownerAddress_fkey" FOREIGN KEY ("ownerAddress") REFERENCES "User"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("tokenId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_userAddress_fkey" FOREIGN KEY ("userAddress") REFERENCES "User"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stake" ADD CONSTRAINT "Stake_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("tokenId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stake" ADD CONSTRAINT "Stake_userAddress_fkey" FOREIGN KEY ("userAddress") REFERENCES "User"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("tokenId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_sellerAddress_fkey" FOREIGN KEY ("sellerAddress") REFERENCES "User"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceUpdate" ADD CONSTRAINT "PriceUpdate_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("tokenId") ON DELETE CASCADE ON UPDATE CASCADE;

-- --- CUSTOM TRIGGERS FOR MUTUAL EXCLUSIVITY ---

CREATE OR REPLACE FUNCTION check_ticket_is_free()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_TABLE_NAME != 'Loan') AND EXISTS (SELECT 1 FROM "Loan" WHERE "ticketId" = NEW."ticketId") THEN
        RAISE EXCEPTION 'Ticket is already in a Loan';
    END IF;
    
    IF (TG_TABLE_NAME != 'Stake') AND EXISTS (SELECT 1 FROM "Stake" WHERE "ticketId" = NEW."ticketId") THEN
        RAISE EXCEPTION 'Ticket is already Staked';
    END IF;
    
    IF (TG_TABLE_NAME != 'Listing') AND EXISTS (SELECT 1 FROM "Listing" WHERE "ticketId" = NEW."ticketId") THEN
        RAISE EXCEPTION 'Ticket is already Listed';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_loan_exclusivity
BEFORE INSERT ON "Loan"
FOR EACH ROW EXECUTE FUNCTION check_ticket_is_free();

CREATE TRIGGER check_stake_exclusivity
BEFORE INSERT ON "Stake"
FOR EACH ROW EXECUTE FUNCTION check_ticket_is_free();

CREATE TRIGGER check_listing_exclusivity
BEFORE INSERT ON "Listing"
FOR EACH ROW EXECUTE FUNCTION check_ticket_is_free();

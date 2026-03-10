package uz.startup.finance.service;

import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.startup.finance.dto.FinanceDtos.CreateTransferRequest;
import uz.startup.finance.dto.FinanceDtos.TransferResponse;
import uz.startup.finance.domain.entity.Account;
import uz.startup.finance.domain.entity.Transfer;
import uz.startup.finance.repo.TransferRepository;
import uz.startup.finance.security.CurrentUserService;

@Service
public class TransferService {

    private final TransferRepository transferRepository;
    private final AccountService accountService;
    private final CurrentUserService currentUserService;

    public TransferService(
            TransferRepository transferRepository,
            AccountService accountService,
            CurrentUserService currentUserService
    ) {
        this.transferRepository = transferRepository;
        this.accountService = accountService;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public List<TransferResponse> listTransfers() {
        return transferRepository.findAllByOwnerIdOrderByTransferDateDescIdDesc(currentUserService.currentUserId()).stream()
                .sorted(Comparator
                        .comparing(Transfer::getTransferDate, Comparator.reverseOrder())
                        .thenComparing(Transfer::getId, Comparator.reverseOrder()))
                .map(FinanceMapper::toTransferResponse)
                .toList();
    }

    @Transactional
    public TransferResponse createTransfer(CreateTransferRequest request) {
        if (request.fromAccountId().equals(request.toAccountId())) {
            throw new BadRequestException("Transfer accounts must be different");
        }

        Account fromAccount = accountService.requireAccount(request.fromAccountId());
        Account toAccount = accountService.requireAccount(request.toAccountId());

        Transfer transfer = new Transfer();
        transfer.setOwner(currentUserService.currentUser());
        transfer.setFromAccount(fromAccount);
        transfer.setToAccount(toAccount);
        transfer.setFromAmount(request.fromAmount());
        transfer.setToAmount(request.toAmount());
        transfer.setRate(request.rate());
        transfer.setTransferDate(request.transferDate());
        transfer.setNote(trimToNull(request.note()));

        return FinanceMapper.toTransferResponse(transferRepository.save(transfer));
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}

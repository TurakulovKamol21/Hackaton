package uz.startup.finance.service;

import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.startup.finance.dto.FinanceDtos.DebtResponse;
import uz.startup.finance.dto.FinanceDtos.UpsertDebtRequest;
import uz.startup.finance.model.DebtRecord;
import uz.startup.finance.repo.DebtRecordRepository;

@Service
public class DebtService {

    private final DebtRecordRepository debtRecordRepository;

    public DebtService(DebtRecordRepository debtRecordRepository) {
        this.debtRecordRepository = debtRecordRepository;
    }

    @Transactional(readOnly = true)
    public List<DebtResponse> listDebts() {
        return debtRecordRepository.findAllByOrderByStatusAscOpenedOnDescIdDesc().stream()
                .map(FinanceMapper::toDebtResponse)
                .toList();
    }

    @Transactional
    public DebtResponse createDebt(UpsertDebtRequest request) {
        DebtRecord debtRecord = new DebtRecord();
        debtRecord.setType(request.type());
        debtRecord.setCounterparty(request.counterparty().trim());
        debtRecord.setAmount(request.amount());
        debtRecord.setCurrency(request.currency().trim().toUpperCase(Locale.ROOT));
        debtRecord.setOpenedOn(request.openedOn());
        debtRecord.setDueDate(request.dueDate());
        debtRecord.setStatus(request.status());
        debtRecord.setNote(trimToNull(request.note()));
        DebtRecord saved = debtRecordRepository.save(debtRecord);
        return FinanceMapper.toDebtResponse(saved);
    }

    @Transactional
    public DebtResponse updateDebt(Long id, UpsertDebtRequest request) {
        DebtRecord debtRecord = debtRecordRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Debt record not found: " + id));
        debtRecord.setType(request.type());
        debtRecord.setCounterparty(request.counterparty().trim());
        debtRecord.setAmount(request.amount());
        debtRecord.setCurrency(request.currency().trim().toUpperCase(Locale.ROOT));
        debtRecord.setOpenedOn(request.openedOn());
        debtRecord.setDueDate(request.dueDate());
        debtRecord.setStatus(request.status());
        debtRecord.setNote(trimToNull(request.note()));
        return FinanceMapper.toDebtResponse(debtRecord);
    }

    @Transactional
    public void deleteDebt(Long id) {
        DebtRecord debtRecord = debtRecordRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Debt record not found: " + id));
        debtRecordRepository.delete(debtRecord);
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}

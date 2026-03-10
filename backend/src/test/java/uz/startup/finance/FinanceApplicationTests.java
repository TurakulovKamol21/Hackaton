package uz.startup.finance;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.mock.web.MockHttpSession;
import uz.startup.finance.domain.enums.TransactionType;
import uz.startup.finance.repo.CategoryRepository;

@SpringBootTest
@AutoConfigureMockMvc
class FinanceApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CategoryRepository categoryRepository;

    @Test
    void registerCreatesAuthenticatedSessionAndAllowsDashboardAccess() throws Exception {
        MockHttpSession session = register("Ali Valiyev", "+998901112233");

        mockMvc.perform(get("/api/dashboard").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accounts").isArray())
                .andExpect(jsonPath("$.balanceTotals").isArray())
                .andExpect(jsonPath("$.calendarItems").isArray())
                .andExpect(jsonPath("$.insights").isArray());
    }

    @Test
    void accountCurrencyChangeIsRejectedWhenHistoryExistsForCurrentUser() throws Exception {
        MockHttpSession session = register("Vali Karimov", "+998901112244");
        Long accountId = createAccount(session, "Main card", "UZS");
        Long expenseCategoryId = categoryRepository.findByNameIgnoreCaseAndType("Grocery", TransactionType.EXPENSE)
                .orElseThrow()
                .getId();

        mockMvc.perform(post("/api/entries")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "type": "EXPENSE",
                                  "amount": 250000.00,
                                  "transactionDate": "2026-03-09",
                                  "title": "Market",
                                  "note": "History lock test",
                                  "categoryId": %d,
                                  "accountId": %d
                                }
                                """.formatted(expenseCategoryId, accountId)))
                .andExpect(status().isCreated());

        mockMvc.perform(put("/api/accounts/{id}", accountId)
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Main card",
                                  "type": "BANK_CARD",
                                  "currency": "USD",
                                  "initialBalance": 2500000.00
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Account currency cannot be changed after transactions or transfers exist"));
    }

    @Test
    void usersOnlySeeTheirOwnAccounts() throws Exception {
        MockHttpSession firstUserSession = register("User One", "+998901112255");
        MockHttpSession secondUserSession = register("User Two", "+998901112266");

        createAccount(firstUserSession, "First wallet", "UZS");

        mockMvc.perform(get("/api/accounts").session(firstUserSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        mockMvc.perform(get("/api/accounts").session(secondUserSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    private MockHttpSession register(String fullName, String phoneNumber) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "%s",
                                  "phoneNumber": "%s",
                                  "password": "DemoPass123",
                                  "confirmPassword": "DemoPass123"
                                }
                                """.formatted(fullName, phoneNumber)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated").value(true))
                .andReturn();

        return (MockHttpSession) result.getRequest().getSession(false);
    }

    private Long createAccount(MockHttpSession session, String name, String currency) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/accounts")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "%s",
                                  "type": "BANK_CARD",
                                  "currency": "%s",
                                  "initialBalance": 2500000.00
                                }
                                """.formatted(name, currency)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode payload = objectMapper.readTree(result.getResponse().getContentAsString());
        return payload.get("id").asLong();
    }
}

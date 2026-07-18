package com.wedding.invitation.platform.storage;

import com.azure.identity.DefaultAzureCredentialBuilder;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import com.azure.storage.blob.models.BlobItem;
import com.azure.storage.blob.models.ListBlobsOptions;
import com.azure.storage.blob.models.UserDelegationKey;
import com.azure.storage.blob.sas.BlobSasPermission;
import com.azure.storage.blob.sas.BlobServiceSasSignatureValues;
import com.azure.storage.common.sas.SasProtocol;
import com.wedding.invitation.config.WeddingProperties;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * Azure Blob Storage 기반 StorageClient (azure 프로파일).
 *
 * <p>키리스(계정 키 미사용): AKS Workload Identity 로 획득한 {@link DefaultAzureCredentialBuilder} 자격증명으로
 * user-delegation key 를 받아 읽기 전용 user-delegation SAS 를 발급한다(HTTPS 전용). 버킷(컨테이너)은 비공개를 유지하고, 만료형 SAS
 * URL 로만 접근을 제공한다.
 *
 * <p>필요 RBAC: 매니지드 ID 에 "Storage Blob Data Reader"(읽기) + "Storage Blob Delegator"(user-delegation
 * key 발급).
 */
@Component
@Profile("azure")
public class AzureBlobStorageClient implements StorageClient {

  private static final Logger log = LoggerFactory.getLogger(AzureBlobStorageClient.class);

  private final BlobServiceClient blobServiceClient;
  private final BlobContainerClient containerClient;

  public AzureBlobStorageClient(WeddingProperties properties) {
    String account = properties.getStorage().getAccount();
    String container = properties.getStorage().getBucket();
    String endpoint = "https://" + account + ".blob.core.windows.net";
    this.blobServiceClient =
        new BlobServiceClientBuilder()
            .endpoint(endpoint)
            .credential(new DefaultAzureCredentialBuilder().build())
            .buildClient();
    this.containerClient = blobServiceClient.getBlobContainerClient(container);
  }

  @Override
  public List<String> listObjectKeys(String prefix) {
    List<String> keys = new ArrayList<>();
    ListBlobsOptions options = new ListBlobsOptions().setPrefix(prefix);
    for (BlobItem item : containerClient.listBlobs(options, null)) {
      keys.add(item.getName());
    }
    return keys;
  }

  @Override
  public String generateSignedUrl(String objectKey, Duration ttl) {
    OffsetDateTime now = OffsetDateTime.now();
    OffsetDateTime expiry = now.plus(ttl);
    // user-delegation key 는 SAS 만료보다 넉넉히 확보(요청 시점 오차 흡수)
    UserDelegationKey delegationKey =
        blobServiceClient.getUserDelegationKey(now.minusMinutes(5), expiry.plusMinutes(5));

    BlobSasPermission permission = new BlobSasPermission().setReadPermission(true);
    BlobServiceSasSignatureValues sasValues =
        new BlobServiceSasSignatureValues(expiry, permission).setProtocol(SasProtocol.HTTPS_ONLY);

    var blobClient = containerClient.getBlobClient(objectKey);
    String sas = blobClient.generateUserDelegationSas(sasValues, delegationKey);
    log.debug("SAS 발급: key={}, expiry={}", objectKey, expiry);
    return blobClient.getBlobUrl() + "?" + sas;
  }
}
